import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// POST - Decline a team invite (public - no auth required)
export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        const { env } = getRequestContext()
        const db = env.DB

        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 500 })
        }

        // Get the invite
        const invite = await db.prepare(`
            SELECT id, status FROM team_invites WHERE token = ?
        `).bind(token).first()

        if (!invite) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
        }

        if (invite.status !== 'pending') {
            return NextResponse.json({
                error: `This invitation has already been ${invite.status}`
            }, { status: 400 })
        }

        // Update invite status to declined
        await db.prepare(`
            UPDATE team_invites SET status = 'declined' WHERE token = ?
        `).bind(token).run()

        return NextResponse.json({
            success: true,
            message: 'Invitation declined'
        })
    } catch (error) {
        console.error('[Decline Team Invite Error]:', error)
        return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 })
    }
}
