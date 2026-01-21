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

// GET /api/client/guests/export - Export guest list as CSV
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('event_id')

        const db = getDB()
        if (!db) {
            return new NextResponse('Database not available', { status: 500 })
        }

        // Get guests for user's events
        let query = `
            SELECT g.name, g.phone, g.email, g.pax, g.status, g.notes, g.created_at, e.title as event_title
            FROM guests g
            JOIN events e ON g.event_id = e.id
            WHERE e.user_id = ?
        `
        const params: string[] = [user.id]

        if (eventId) {
            query += ' AND g.event_id = ?'
            params.push(eventId)
        }

        query += ' ORDER BY g.created_at DESC'

        const { results: guests } = await db.prepare(query).bind(...params).all()

        if (!guests || guests.length === 0) {
            // Return empty CSV with headers
            const headers = 'Event,Name,Phone,Email,Pax,Status,Notes,RSVP Date\n'
            return new NextResponse(headers, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="guests-export-${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        }

        // Generate CSV
        const headers = 'Event,Name,Phone,Email,Pax,Status,Notes,RSVP Date\n'
        const rows = guests.map((g: {
            event_title?: string;
            name?: string;
            phone?: string;
            email?: string;
            pax?: number;
            status?: string;
            notes?: string;
            created_at?: string;
        }) => {
            const escapeCsv = (val: string | number | undefined | null) => {
                if (val === null || val === undefined) return ''
                const str = String(val)
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`
                }
                return str
            }

            return [
                escapeCsv(g.event_title),
                escapeCsv(g.name),
                escapeCsv(g.phone),
                escapeCsv(g.email),
                escapeCsv(g.pax),
                escapeCsv(g.status),
                escapeCsv(g.notes),
                escapeCsv(g.created_at ? new Date(g.created_at).toLocaleDateString() : '')
            ].join(',')
        }).join('\n')

        const csv = headers + rows

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="guests-export-${new Date().toISOString().split('T')[0]}.csv"`
            }
        })
    } catch (error) {
        console.error('[Guest Export Error]:', error)
        return NextResponse.json({ error: 'Export failed' }, { status: 500 })
    }
}
