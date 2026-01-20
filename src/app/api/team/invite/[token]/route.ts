import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// GET - Get invite details by token (public route)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        const { env } = getRequestContext()
        const db = env.DB

        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 500 })
        }

        // Get invite with owner details
        const invite = await db.prepare(`
            SELECT 
                ti.id,
                ti.invitee_email,
                ti.role,
                ti.status,
                ti.expires_at,
                ti.created_at,
                u.name as owner_name,
                u.email as owner_email
            FROM team_invites ti
            JOIN users u ON ti.team_owner_id = u.id
            WHERE ti.token = ?
        `).bind(token).first()

        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
        }

        // Check if expired
        const isExpired = new Date(invite.expires_at as string) < new Date()

        if (invite.status !== 'pending') {
            return NextResponse.json({
                error: `This invitation has already been ${invite.status}`,
                status: invite.status
            }, { status: 400 })
        }

        if (isExpired) {
            // Update status to expired
            await db.prepare(`
                UPDATE team_invites SET status = 'expired' WHERE token = ?
            `).bind(token).run()

            return NextResponse.json({
                error: 'This invitation has expired',
                status: 'expired'
            }, { status: 400 })
        }

        return NextResponse.json({
            invite: {
                id: invite.id,
                inviteeEmail: invite.invitee_email,
                role: invite.role,
                ownerName: invite.owner_name,
                ownerEmail: invite.owner_email,
                expiresAt: invite.expires_at,
                createdAt: invite.created_at
            }
        })
    } catch (error) {
        console.error('[Get Team Invite Error]:', error)
        return NextResponse.json({ error: 'Failed to get invitation details' }, { status: 500 })
    }
}
