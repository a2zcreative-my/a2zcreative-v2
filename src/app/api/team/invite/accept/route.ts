import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// POST - Accept a team invite
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'You must be logged in to accept an invitation' }, { status: 401 })
        }

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
            SELECT id, team_owner_id, invitee_email, role, status, expires_at
            FROM team_invites
            WHERE token = ?
        `).bind(token).first()

        if (!invite) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
        }

        if (invite.status !== 'pending') {
            return NextResponse.json({
                error: `This invitation has already been ${invite.status}`
            }, { status: 400 })
        }

        // Check if expired
        if (new Date(invite.expires_at as string) < new Date()) {
            await db.prepare(`
                UPDATE team_invites SET status = 'expired' WHERE token = ?
            `).bind(token).run()
            return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
        }

        // Verify email matches (case-insensitive)
        if (user.email?.toLowerCase() !== (invite.invitee_email as string).toLowerCase()) {
            return NextResponse.json({
                error: 'This invitation was sent to a different email address'
            }, { status: 403 })
        }

        // Check if already a member
        const existingMember = await db.prepare(`
            SELECT id FROM team_members
            WHERE team_owner_id = ? AND member_user_id = ?
        `).bind(invite.team_owner_id, user.id).first()

        if (existingMember) {
            // Update invite status and return success
            await db.prepare(`
                UPDATE team_invites SET status = 'accepted' WHERE token = ?
            `).bind(token).run()
            return NextResponse.json({
                success: true,
                message: 'You are already a member of this team'
            })
        }

        // Add user to team
        const memberId = crypto.randomUUID()
        await db.prepare(`
            INSERT INTO team_members (id, team_owner_id, member_user_id, role)
            VALUES (?, ?, ?, ?)
        `).bind(memberId, invite.team_owner_id, user.id, invite.role).run()

        // Update invite status
        await db.prepare(`
            UPDATE team_invites SET status = 'accepted' WHERE token = ?
        `).bind(token).run()

        return NextResponse.json({
            success: true,
            message: 'You have successfully joined the team!'
        })
    } catch (error) {
        console.error('[Accept Team Invite Error]:', error)
        return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
    }
}
