import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// Helper to get D1 database using proper Cloudflare binding
function getDB() {
    try {
        const { env } = getRequestContext()
        return env.DB
    } catch {
        // Fallback for local development
        // @ts-expect-error - Cloudflare bindings available at runtime
        return globalThis.DB
    }
}

interface TicketSubmitRequest {
    category: string
    subject: string
    description: string
}

// Generate ticket number like TKT-0001, TKT-0002, etc.
async function generateTicketNumber(db: unknown): Promise<string> {
    const database = db as { prepare: (sql: string) => { first: <T>() => Promise<T | null> } }
    const result = await database.prepare(
        'SELECT COUNT(*) as count FROM support_tickets'
    ).first<{ count: number }>()

    const count = (result?.count || 0) + 1
    return `TKT-${count.toString().padStart(4, '0')}`
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login to submit a ticket.' },
                { status: 401 }
            )
        }

        const body: TicketSubmitRequest = await request.json()
        const { category, subject, description } = body

        if (!category || !subject || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: category, subject, description' },
                { status: 400 }
            )
        }

        // Access D1 binding from Cloudflare environment
        const db = getDB()

        if (!db) {
            // D1 not available - return simulated success for development
            const ticketNumber = `TKT-${Date.now().toString().slice(-4)}`
            console.log('[Ticket] D1 not bound, simulating ticket creation:', { ticketNumber, category, subject })
            return NextResponse.json({
                success: true,
                ticketNumber,
                message: 'Ticket submitted (D1 not configured - simulated)',
            })
        }

        // Generate unique ticket number
        const ticketNumber = await generateTicketNumber(db)
        const ticketId = crypto.randomUUID()

        // Insert ticket into D1
        await db.prepare(`
            INSERT INTO support_tickets (id, ticket_number, user_id, user_email, user_name, category, subject, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            ticketId,
            ticketNumber,
            user.id,
            user.email,
            user.user_metadata?.name || null,
            category,
            subject,
            description
        ).run()

        return NextResponse.json({
            success: true,
            ticketNumber,
            ticketId,
            message: 'Ticket submitted successfully',
        })
    } catch (error) {
        console.error('[Ticket Submit Error]:', error)
        return NextResponse.json(
            { error: 'Failed to submit ticket', details: String(error) },
            { status: 500 }
        )
    }
}

// GET endpoint to fetch user's tickets
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const db = getDB()

        if (!db) {
            return NextResponse.json({ tickets: [] })
        }

        const tickets = await db.prepare(`
            SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC
        `).bind(user.id).all()

        return NextResponse.json({ tickets: tickets.results })
    } catch (error) {
        console.error('[Ticket Fetch Error]:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tickets' },
            { status: 500 }
        )
    }
}
