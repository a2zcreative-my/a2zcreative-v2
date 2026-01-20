import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Resend } from 'resend'

export const runtime = 'edge'

function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
}

// POST - Send team invite
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { email, role = 'editor' } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Validate role
        if (!['editor', 'viewer'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        const { env } = getRequestContext()
        const db = env.DB

        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 500 })
        }

        // Check if user has exclusive plan
        const dbUser = await db.prepare(
            'SELECT plan, name, email FROM users WHERE id = ?'
        ).bind(user.id).first()

        if (dbUser?.plan !== 'exclusive') {
            return NextResponse.json({
                error: 'Team management requires an Exclusive plan',
                requiresUpgrade: true
            }, { status: 403 })
        }

        // Check if already a team member
        const existingMember = await db.prepare(`
            SELECT id FROM team_members tm
            JOIN users u ON tm.member_user_id = u.id
            WHERE tm.team_owner_id = ? AND u.email = ?
        `).bind(user.id, email.toLowerCase()).first()

        if (existingMember) {
            return NextResponse.json({ error: 'This user is already a team member' }, { status: 400 })
        }

        // Check if there's already a pending invite
        const existingInvite = await db.prepare(`
            SELECT id FROM team_invites 
            WHERE team_owner_id = ? AND invitee_email = ? AND status = 'pending'
        `).bind(user.id, email.toLowerCase()).first()

        if (existingInvite) {
            return NextResponse.json({ error: 'An invite is already pending for this email' }, { status: 400 })
        }

        // Generate invite token and expiry (7 days)
        const token = generateToken()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const inviteId = crypto.randomUUID()

        // Create invite
        await db.prepare(`
            INSERT INTO team_invites (id, team_owner_id, invitee_email, role, token, status, expires_at)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
        `).bind(inviteId, user.id, email.toLowerCase(), role, token, expiresAt).run()

        // Send email via Resend
        const resendKey = process.env.RESEND_API_KEY
        if (resendKey) {
            const resend = new Resend(resendKey)
            const inviteUrl = `${request.headers.get('origin') || 'https://a2zcreative.my'}/team/invite/${token}`
            const ownerName = dbUser?.name || dbUser?.email || 'A team owner'

            await resend.emails.send({
                from: 'A2ZCreative <team@a2zcreative.my>',
                to: email,
                subject: `You've been invited to join ${ownerName}'s team on A2ZCreative`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #6366f1; margin: 0;">A2ZCreative</h1>
                        </div>
                        <h2 style="color: #1f2937;">You're invited to join a team!</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            <strong>${ownerName}</strong> has invited you to join their team on A2ZCreative as an <strong>${role}</strong>.
                        </p>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            As a team member, you'll be able to collaborate on events and help manage their digital invitations.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${inviteUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Accept Invitation
                            </a>
                        </div>
                        <p style="color: #9ca3af; font-size: 14px;">
                            This invitation will expire in 7 days. If you don't want to join, you can simply ignore this email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                            © ${new Date().getFullYear()} A2ZCreative. All rights reserved.
                        </p>
                    </div>
                `
            })
        }

        return NextResponse.json({
            success: true,
            message: `Invitation sent to ${email}`
        })
    } catch (error) {
        console.error('[Team Invite Error]:', error)
        return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
    }
}

// DELETE - Cancel a pending invite
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { inviteId } = await request.json()

        if (!inviteId) {
            return NextResponse.json({ error: 'Invite ID is required' }, { status: 400 })
        }

        const { env } = getRequestContext()
        const db = env.DB

        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 500 })
        }

        // Delete the invite (only if current user is the owner)
        const result = await db.prepare(`
            DELETE FROM team_invites 
            WHERE id = ? AND team_owner_id = ? AND status = 'pending'
        `).bind(inviteId, user.id).run()

        if (result.meta.changes === 0) {
            return NextResponse.json({ error: 'Invite not found or not authorized' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Cancel Team Invite Error]:', error)
        return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
    }
}
