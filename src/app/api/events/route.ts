import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
function getDB(request: NextRequest) {
    // @ts-expect-error - Cloudflare bindings
    return request.cf?.env?.DB || globalThis.DB
}

// GET /api/events - List current user's events
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB(request)
        if (!db) {
            // Return empty array if D1 not available
            return NextResponse.json({ events: [], message: 'D1 not configured' })
        }

        const { results } = await db.prepare(`
            SELECT * FROM events 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `).bind(user.id).all()

        return NextResponse.json({ events: results || [] })
    } catch (error) {
        console.error('[Events API Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, type, event_date, plan, status } = body

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        const db = getDB(request)
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        const id = crypto.randomUUID()

        await db.prepare(`
            INSERT INTO events (id, user_id, title, type, event_date, plan, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            user.id,
            title,
            type || null,
            event_date || null,
            plan || 'starter',
            status || 'draft'
        ).run()

        return NextResponse.json({
            success: true,
            event: { id, title, user_id: user.id }
        })
    } catch (error) {
        console.error('[Events API Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
