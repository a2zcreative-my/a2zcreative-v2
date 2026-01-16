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

// GET /api/events/[id] - Get single event (with ownership check)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB(request)
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        const event = await db.prepare(`
            SELECT * FROM events WHERE id = ? AND user_id = ?
        `).bind(id, user.id).first()

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        return NextResponse.json({ event })
    } catch (error) {
        console.error('[Event API Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// PUT /api/events/[id] - Update event (with ownership check)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB(request)
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        // Verify ownership first
        const existing = await db.prepare(`
            SELECT user_id FROM events WHERE id = ?
        `).bind(id).first()

        if (!existing) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { title, type, event_date, status, plan, settings } = body

        await db.prepare(`
            UPDATE events SET
                title = COALESCE(?, title),
                type = COALESCE(?, type),
                event_date = COALESCE(?, event_date),
                status = COALESCE(?, status),
                plan = COALESCE(?, plan),
                settings = COALESCE(?, settings),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            type || null,
            event_date || null,
            status || null,
            plan || null,
            settings ? JSON.stringify(settings) : null,
            id
        ).run()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Event API Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// DELETE /api/events/[id] - Delete event (with ownership check)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB(request)
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        // Verify ownership and delete
        const result = await db.prepare(`
            DELETE FROM events WHERE id = ? AND user_id = ?
        `).bind(id, user.id).run()

        if (result.meta.changes === 0) {
            return NextResponse.json({ error: 'Event not found or not owned by user' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Event API Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
