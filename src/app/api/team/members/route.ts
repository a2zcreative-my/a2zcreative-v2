import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// GET - List team members for current user
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { env } = getRequestContext()
        const db = env.DB

        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 500 })
        }

        // Check if user has exclusive plan
        const dbUser = await db.prepare(
            'SELECT plan FROM users WHERE id = ?'
        ).bind(user.id).first()

        if (dbUser?.plan !== 'exclusive') {
            return NextResponse.json({
                error: 'Team management requires an Exclusive plan',
                requiresUpgrade: true
            }, { status: 403 })
        }

        // Get team members with user details
        const members = await db.prepare(`
            SELECT 
                tm.id,
                tm.role,
                tm.created_at,
                u.id as user_id,
                u.email,
                u.name,
                u.avatar_url
            FROM team_members tm
            JOIN users u ON tm.member_user_id = u.id
            WHERE tm.team_owner_id = ?
            ORDER BY tm.created_at DESC
        `).bind(user.id).all()

        // Get pending invites
        const invites = await db.prepare(`
            SELECT id, invitee_email, role, status, expires_at, created_at
            FROM team_invites
            WHERE team_owner_id = ? AND status = 'pending'
            ORDER BY created_at DESC
        `).bind(user.id).all()

        return NextResponse.json({
            members: members.results || [],
            pendingInvites: invites.results || []
        })
    } catch (error) {
        console.error('[Team Members Error]:', error)
        return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }
}

// DELETE - Remove a team member
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { memberId } = await request.json()

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
        }

        const { env } = getRequestContext()
        const db = env.DB

        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 500 })
        }

        // Delete the team member (only if current user is the owner)
        const result = await db.prepare(`
            DELETE FROM team_members 
            WHERE id = ? AND team_owner_id = ?
        `).bind(memberId, user.id).run()

        if (result.meta.changes === 0) {
            return NextResponse.json({ error: 'Member not found or not authorized' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Remove Team Member Error]:', error)
        return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
    }
}
