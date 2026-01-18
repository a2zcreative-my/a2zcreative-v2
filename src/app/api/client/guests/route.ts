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

// GET /api/client/guests - Get all guests for current user's events
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ guests: [], events: [] })
        }

        // First get user's events
        const { results: events } = await db.prepare(`
            SELECT id, title FROM events WHERE user_id = ?
        `).bind(user.id).all()

        if (!events || events.length === 0) {
            return NextResponse.json({ guests: [], events: [] })
        }

        // Get guests for all user's events
        const eventIds = events.map((e: { id: string }) => e.id)
        const placeholders = eventIds.map(() => '?').join(',')

        const { results: guests } = await db.prepare(`
            SELECT g.*, e.title as event_title
            FROM guests g
            JOIN events e ON g.event_id = e.id
            WHERE g.event_id IN (${placeholders})
            ORDER BY g.created_at DESC
        `).bind(...eventIds).all()

        const formattedGuests = (guests || []).map((g: {
            id: string;
            name: string;
            email?: string;
            phone?: string;
            event_title?: string;
            status?: string;
            pax?: number;
        }) => ({
            id: g.id,
            name: g.name,
            email: g.email || '',
            phone: g.phone || '',
            event: g.event_title || 'Unknown Event',
            status: g.status || 'pending',
            pax: g.pax || 1
        }))

        return NextResponse.json({
            guests: formattedGuests,
            events: events.map((e: { id: string; title: string }) => ({ id: e.id, name: e.title }))
        })
    } catch (error) {
        console.error('[Guests API Error]:', error)
        return NextResponse.json({ guests: [], events: [] })
    }
}

// POST /api/client/guests - Add a new guest
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, email, phone, eventId, pax } = body

        if (!name || !eventId) {
            return NextResponse.json({ error: 'Name and event are required' }, { status: 400 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        // Verify event belongs to user
        const event = await db.prepare(`
            SELECT id FROM events WHERE id = ? AND user_id = ?
        `).bind(eventId, user.id).first()

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        const id = crypto.randomUUID()
        await db.prepare(`
            INSERT INTO guests (id, event_id, name, email, phone, pax, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `).bind(id, eventId, name, email || null, phone || null, pax || 1).run()

        return NextResponse.json({ success: true, id })
    } catch (error) {
        console.error('[Guests POST Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
