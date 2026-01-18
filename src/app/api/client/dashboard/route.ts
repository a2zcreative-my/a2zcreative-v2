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

// GET /api/client/dashboard - Get dashboard data for current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()

        // Default empty response if D1 not available
        const emptyResponse = {
            stats: {
                totalEvents: 0,
                totalViews: 0,
                activeEvents: 0,
                totalRsvps: 0
            },
            publishedInvitations: [],
            draftEvents: []
        }

        if (!db) {
            return NextResponse.json(emptyResponse)
        }

        // Fetch user's events
        const { results: events } = await db.prepare(`
            SELECT * FROM events 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `).bind(user.id).all()

        const eventsList = events || []

        // Calculate stats
        const totalEvents = eventsList.length
        const totalViews = eventsList.reduce((sum: number, e: { views?: number }) => sum + (e.views || 0), 0)
        const activeEvents = eventsList.filter((e: { status?: string }) => e.status === 'published').length
        const totalRsvps = eventsList.reduce((sum: number, e: { rsvp_count?: number }) => sum + (e.rsvp_count || 0), 0)

        // Separate published and draft events
        const publishedInvitations = eventsList
            .filter((e: { status?: string }) => e.status === 'published')
            .map((e: { id: string; title: string; type?: string; event_date?: string; plan?: string; views?: number; rsvp_count?: number }) => ({
                id: e.id,
                title: e.title,
                eventType: e.type || 'Event',
                date: e.event_date || 'TBD',
                plan: e.plan || 'starter',
                views: e.views || 0,
                rsvp: { confirmed: e.rsvp_count || 0, pending: 0, declined: 0 },
                status: 'live'
            }))

        const draftEvents = eventsList
            .filter((e: { status?: string }) => e.status === 'draft')
            .map((e: { id: string; title: string; type?: string; plan?: string }) => ({
                id: e.id,
                title: e.title,
                eventType: e.type || 'Event',
                plan: e.plan || 'starter',
                progress: 30 // Default progress for draft
            }))

        return NextResponse.json({
            stats: {
                totalEvents,
                totalViews,
                activeEvents,
                totalRsvps
            },
            publishedInvitations,
            draftEvents
        })
    } catch (error) {
        console.error('[Dashboard API Error]:', error)
        // Return empty data instead of error for graceful handling
        return NextResponse.json({
            stats: { totalEvents: 0, totalViews: 0, activeEvents: 0, totalRsvps: 0 },
            publishedInvitations: [],
            draftEvents: []
        })
    }
}
