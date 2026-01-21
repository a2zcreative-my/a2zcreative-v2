import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// Helper to get current user
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

interface Activity {
    id: string
    type: 'rsvp' | 'view' | 'notification' | 'guest'
    title: string
    description: string
    timestamp: string
    icon: string
}

// GET /api/client/activity - Get recent activity for the user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ activities: getMockActivities() })
        }

        const activities: Activity[] = []

        // Get recent notifications
        try {
            const { results: notifications } = await db.prepare(`
                SELECT id, title, message, type, created_at 
                FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            `).bind(user.id).all()

            if (notifications) {
                for (const n of notifications as { id: string; title: string; message: string; type: string; created_at: string }[]) {
                    activities.push({
                        id: `notif-${n.id}`,
                        type: 'notification',
                        title: n.title,
                        description: n.message,
                        timestamp: n.created_at,
                        icon: getIconForType(n.type)
                    })
                }
            }
        } catch (e) {
            console.log('Notifications table may not exist:', e)
        }

        // Get recent guests/RSVPs
        try {
            const { results: guests } = await db.prepare(`
                SELECT g.id, g.name, g.status, g.created_at, e.title as event_title
                FROM guests g
                JOIN events e ON g.event_id = e.id
                WHERE e.user_id = ?
                ORDER BY g.created_at DESC
                LIMIT 10
            `).bind(user.id).all()

            if (guests) {
                for (const g of guests as { id: string; name: string; status: string; created_at: string; event_title: string }[]) {
                    activities.push({
                        id: `guest-${g.id}`,
                        type: 'rsvp',
                        title: `${g.name} ${g.status === 'confirmed' ? 'confirmed' : g.status === 'declined' ? 'declined' : 'responded'}`,
                        description: `RSVP for ${g.event_title}`,
                        timestamp: g.created_at,
                        icon: g.status === 'confirmed' ? '✓' : g.status === 'declined' ? '✗' : '?'
                    })
                }
            }
        } catch (e) {
            console.log('Guests table may not exist:', e)
        }

        // Sort by timestamp and limit
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        const recentActivities = activities.slice(0, 15)

        return NextResponse.json({ activities: recentActivities.length > 0 ? recentActivities : getMockActivities() })
    } catch (error) {
        console.error('[Activity API Error]:', error)
        return NextResponse.json({ activities: getMockActivities() })
    }
}

function getIconForType(type: string): string {
    switch (type) {
        case 'success': return '✓'
        case 'warning': return '⚠'
        case 'error': return '✗'
        case 'info': return 'ℹ'
        default: return '•'
    }
}

function getMockActivities(): Activity[] {
    const now = new Date()
    return [
        {
            id: 'mock-1',
            type: 'notification',
            title: 'Welcome to A2ZCreative!',
            description: 'Start by creating your first event',
            timestamp: now.toISOString(),
            icon: '🎉'
        },
        {
            id: 'mock-2',
            type: 'notification',
            title: 'Tip: Explore Templates',
            description: 'Check out our beautiful invitation templates',
            timestamp: new Date(now.getTime() - 3600000).toISOString(),
            icon: '💡'
        }
    ]
}
