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

// GET /api/client/checkin - Get check-in data for current user's events
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

        // Get user's events
        const { results: events } = await db.prepare(`
            SELECT id, title, event_date FROM events WHERE user_id = ?
        `).bind(user.id).all()

        if (!events || events.length === 0) {
            return NextResponse.json({ guests: [], events: [] })
        }

        // Get confirmed guests for all user's events
        const eventIds = events.map((e: { id: string }) => e.id)
        const placeholders = eventIds.map(() => '?').join(',')

        const { results: guests } = await db.prepare(`
            SELECT g.*, e.title as event_title
            FROM guests g
            JOIN events e ON g.event_id = e.id
            WHERE g.event_id IN (${placeholders}) AND g.status = 'confirmed'
            ORDER BY g.name ASC
        `).bind(...eventIds).all()

        const formattedGuests = (guests || []).map((g: {
            id: string;
            name: string;
            pax?: number;
            event_title?: string;
            checked_in?: number;
            checked_in_at?: string;
        }, idx: number) => ({
            id: g.id,
            name: g.name,
            pax: g.pax || 1,
            checkedIn: g.checked_in === 1,
            checkInTime: g.checked_in_at || null,
            table: `T${idx + 1}`, // Generate table number
            event: g.event_title || 'Unknown Event',
            qrCode: `GUEST-${g.id.substring(0, 8).toUpperCase()}`
        }))

        const formattedEvents = events.map((e: { id: string; title: string }) => ({
            id: e.id,
            name: e.title
        }))

        return NextResponse.json({ guests: formattedGuests, events: formattedEvents })
    } catch (error) {
        console.error('[Check-in API Error]:', error)
        return NextResponse.json({ guests: [], events: [] })
    }
}

// POST /api/client/checkin - Check in a guest
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { guestId } = body

        if (!guestId) {
            return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        // Verify guest belongs to user's event
        const guest = await db.prepare(`
            SELECT g.id FROM guests g
            JOIN events e ON g.event_id = e.id
            WHERE g.id = ? AND e.user_id = ?
        `).bind(guestId, user.id).first()

        if (!guest) {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
        }

        // Update check-in status
        const now = new Date().toISOString()
        await db.prepare(`
            UPDATE guests SET checked_in = 1, checked_in_at = ? WHERE id = ?
        `).bind(now, guestId).run()

        return NextResponse.json({ success: true, checkedInAt: now })
    } catch (error) {
        console.error('[Check-in POST Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
