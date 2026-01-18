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

// GET /api/client/rsvp - Get RSVP tracking data for current user's events
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ rsvps: [], stats: { total: 0, confirmed: 0, pending: 0, declined: 0, totalPax: 0 } })
        }

        // Get user's events
        const { results: events } = await db.prepare(`
            SELECT id, title FROM events WHERE user_id = ?
        `).bind(user.id).all()

        if (!events || events.length === 0) {
            return NextResponse.json({ rsvps: [], stats: { total: 0, confirmed: 0, pending: 0, declined: 0, totalPax: 0 } })
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

        const guestList = guests || []

        // Format RSVPs
        const rsvps = guestList.map((g: {
            id: string;
            name: string;
            email?: string;
            event_title?: string;
            status?: string;
            pax?: number;
            created_at?: string;
            notes?: string;
        }) => ({
            id: g.id,
            name: g.name,
            email: g.email || '',
            event: g.event_title || 'Unknown Event',
            status: g.status || 'pending',
            pax: g.status === 'confirmed' ? (g.pax || 1) : 0,
            respondedAt: g.status !== 'pending' ? g.created_at : null,
            message: g.notes || null
        }))

        // Calculate stats
        const stats = {
            total: guestList.length,
            confirmed: guestList.filter((g: { status?: string }) => g.status === 'confirmed').length,
            pending: guestList.filter((g: { status?: string }) => g.status === 'pending').length,
            declined: guestList.filter((g: { status?: string }) => g.status === 'declined').length,
            totalPax: guestList
                .filter((g: { status?: string }) => g.status === 'confirmed')
                .reduce((sum: number, g: { pax?: number }) => sum + (g.pax || 1), 0)
        }

        return NextResponse.json({ rsvps, stats })
    } catch (error) {
        console.error('[RSVP API Error]:', error)
        return NextResponse.json({ rsvps: [], stats: { total: 0, confirmed: 0, pending: 0, declined: 0, totalPax: 0 } })
    }
}
