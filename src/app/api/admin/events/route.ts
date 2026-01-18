import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

function getDB() {
    try {
        const { env } = getRequestContext()
        return env.DB
    } catch {
        // @ts-expect-error - Cloudflare bindings
        return globalThis.DB
    }
}

// GET /api/admin/events - List all events for admin
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        // Check admin
        const currentUser = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first() as { role: string } | null

        if (currentUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // Fetch stats and events in batch
        const [totalResult, publishedResult, rsvpResult, eventsResult] = await db.batch([
            db.prepare(`SELECT COUNT(*) as count FROM events`),
            db.prepare(`SELECT COUNT(*) as count FROM events WHERE status = 'published'`),
            db.prepare(`SELECT COALESCE(SUM(rsvp_count), 0) as total FROM events`),
            db.prepare(`
                SELECT e.id, e.title, e.type, e.event_date, e.status, e.plan, e.views, e.rsvp_count, e.created_at,
                       COALESCE(u.name, u.email) as owner_name, u.email as owner_email
                FROM events e
                LEFT JOIN users u ON e.user_id = u.id
                ORDER BY e.created_at DESC
                LIMIT 50
            `)
        ])

        const stats = {
            totalEvents: (totalResult.results?.[0] as any)?.count || 0,
            publishedEvents: (publishedResult.results?.[0] as any)?.count || 0,
            totalRsvps: (rsvpResult.results?.[0] as any)?.total || 0
        }

        const events = (eventsResult.results || []).map((e: any) => ({
            id: e.id,
            title: e.title || 'Untitled Event',
            owner: e.owner_name || 'Unknown',
            ownerEmail: e.owner_email || '',
            eventType: e.type || 'Event',
            date: e.event_date,
            plan: e.plan || 'starter',
            views: e.views || 0,
            rsvpCount: e.rsvp_count || 0,
            status: e.status || 'draft',
            createdAt: e.created_at
        }))

        return NextResponse.json({ stats, events })
    } catch (error) {
        console.error('[Admin Events Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
