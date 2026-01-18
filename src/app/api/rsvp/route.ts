import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface RsvpRequest {
    eventSlug: string
    name: string
    phone?: string
    email?: string
    pax: number
    attending: 'yes' | 'no'
}

// Generate a unique guest ID
function generateGuestId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'GUEST-'
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result.toUpperCase()
}

export async function POST(request: NextRequest) {
    try {
        const body: RsvpRequest = await request.json()
        const { eventSlug, name, phone, email, pax, attending } = body

        if (!eventSlug || !name) {
            return NextResponse.json(
                { error: 'Missing required fields: eventSlug, name' },
                { status: 400 }
            )
        }

        // Generate unique guest ID
        const guestId = generateGuestId()
        const createdAt = new Date().toISOString()

        // Try to save to D1 database if available
        // @ts-expect-error - Cloudflare bindings available at runtime
        const db = request.cf?.env?.DB || globalThis.DB

        if (db) {
            try {
                await db.prepare(`
                    INSERT INTO rsvp (id, event_slug, name, phone, email, pax, attending, qr_code, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    guestId,
                    eventSlug,
                    name,
                    phone || null,
                    email || null,
                    pax,
                    attending,
                    guestId, // Store guest ID, not the full data URL
                    createdAt
                ).run()

                console.log(`[RSVP] Saved to database: ${guestId}`)
            } catch (dbError) {
                console.error('[RSVP] Database error:', dbError)
                // Don't fail - still return QR code even if DB save fails
            }
        } else {
            console.log('[RSVP] D1 not available, skipping database save:', { guestId, name, eventSlug })
        }

        return NextResponse.json({
            success: true,
            guestId,
            // QR code will be generated on the client-side using the guestId
            message: attending === 'yes'
                ? `Thank you ${name}! Your attendance is confirmed.`
                : `Thank you ${name} for letting us know.`,
            rsvp: {
                guestId,
                eventSlug,
                name,
                pax,
                attending,
                createdAt
            }
        })
    } catch (error) {
        console.error('[RSVP Error]:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process RSVP',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// GET: Retrieve RSVP by guest ID (for check-in verification)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId')

    if (!guestId) {
        return NextResponse.json(
            { error: 'Missing guestId parameter' },
            { status: 400 }
        )
    }

    // @ts-expect-error - Cloudflare bindings available at runtime
    const db = request.cf?.env?.DB || globalThis.DB

    if (!db) {
        return NextResponse.json(
            { error: 'Database not available' },
            { status: 503 }
        )
    }

    try {
        const rsvp = await db.prepare('SELECT * FROM rsvp WHERE id = ?').bind(guestId).first()

        if (!rsvp) {
            return NextResponse.json(
                { error: 'RSVP not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            rsvp
        })
    } catch (error) {
        console.error('[RSVP GET Error]:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve RSVP' },
            { status: 500 }
        )
    }
}
