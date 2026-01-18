import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// Helper to get current user from Supabase
async function getCurrentUser(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = cookieHeader.split(';').map(c => {
        const [name, ...rest] = c.trim().split('=')
        return { name: name || '', value: rest.join('=') }
    }).filter(c => c.name)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookies,
                setAll: () => { },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Helper to get D1 database
function getDB() {
    try {
        const { env } = getRequestContext()
        return env.DB
    } catch {
        // @ts-expect-error - Cloudflare bindings available at runtime
        return globalThis.DB
    }
}

// GET /api/client/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ notifications: [], unreadCount: 0 })
        }

        // Fetch user's notifications
        const { results: notifications } = await db.prepare(`
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC
            LIMIT 50
        `).bind(user.id).all()

        const notificationList = notifications || []
        const unreadCount = notificationList.filter((n: { read?: number }) => !n.read).length

        // Format notifications
        const formattedNotifications = notificationList.map((n: {
            id: string;
            type?: string;
            title: string;
            message?: string;
            read?: number;
            created_at?: string;
        }) => ({
            id: n.id,
            type: n.type || 'info',
            title: n.title,
            message: n.message || '',
            read: n.read === 1,
            time: n.created_at ? formatTimeAgo(new Date(n.created_at)) : 'Just now'
        }))

        return NextResponse.json({
            notifications: formattedNotifications,
            unreadCount
        })
    } catch (error) {
        console.error('[Notifications API Error]:', error)
        return NextResponse.json({ notifications: [], unreadCount: 0 })
    }
}

// POST /api/client/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { notificationId, markAllRead } = body

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        if (markAllRead) {
            // Mark all notifications as read for this user
            await db.prepare(`
                UPDATE notifications SET read = 1 WHERE user_id = ?
            `).bind(user.id).run()
        } else if (notificationId) {
            // Mark specific notification as read
            await db.prepare(`
                UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?
            `).bind(notificationId, user.id).run()
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Notifications POST Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// Helper to format time ago
function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
}
