import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'edge'

interface UserSyncRequest {
    id: string
    email: string
    name?: string
    phone?: string
    plan?: string
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const body: UserSyncRequest = await request.json()
        const { id, email, name, phone, plan } = body

        if (!id || !email) {
            return NextResponse.json(
                { error: 'Missing required fields: id, email' },
                { status: 400 }
            )
        }

        // Access D1 binding from Cloudflare environment
        // @ts-expect-error - Cloudflare bindings available at runtime
        const db = request.cf?.env?.DB || globalThis.DB

        if (!db) {
            // D1 not available - log but don't fail
            console.log('[User Sync] D1 not bound, skipping sync:', { id, email, name })
            return NextResponse.json({
                success: true,
                message: 'Sync skipped (D1 not configured)',
                user: { id, email }
            })
        }

        // Check if user exists (to determine if we should send welcome email)
        const existingUser = await db.prepare('SELECT id FROM users WHERE id = ?').bind(id).first()
        const isNewUser = !existingUser

        // Upsert user to D1
        await db.prepare(`
            INSERT INTO users (id, email, name, phone, plan, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                email = excluded.email,
                name = COALESCE(excluded.name, users.name),
                phone = COALESCE(excluded.phone, users.phone),
                plan = COALESCE(excluded.plan, users.plan),
                updated_at = datetime('now')
        `).bind(id, email, name || null, phone || null, plan || 'starter').run()

        // Send Welcome Email if new user
        if (isNewUser) {
            try {
                if (process.env.RESEND_API_KEY) {
                    await resend.emails.send({
                        from: 'A2ZCreative <onboarding@resend.dev>', // Update this with your verified domain
                        to: email,
                        subject: 'Welcome to A2ZCreative! 🎉',
                        html: `
                            <div style="font-family: sans-serif; max-w-600px; margin: 0 auto;">
                                <h1 style="color: #4F46E5;">Welcome to A2ZCreative!</h1>
                                <p>Hi ${name || 'there'},</p>
                                <p>We're thrilled to have you on board! You've just taken the first step towards creating unforgettable digital experiences for your events.</p>
                                <p>Here is what you can do next:</p>
                                <ul>
                                    <li>Create your first event</li>
                                    <li>Customize your invitation design</li>
                                    <li>Manage your guest list</li>
                                </ul>
                                <p>If you have any questions, feel free to reply to this email.</p>
                                <br/>
                                <p>Best regards,</p>
                                <p>The A2ZCreative Team</p>
                            </div>
                        `
                    })
                    console.log(`[Welcome Email] Sent to ${email}`)
                } else {
                    console.log(`[Welcome Email] Skipped - RESEND_API_KEY not found`)
                }
            } catch (emailError) {
                console.error('[Welcome Email Error]:', emailError)
                // Don't fail the sync request if email fails
            }
        }

        return NextResponse.json({
            success: true,
            message: isNewUser ? 'User created and welcome email sent' : 'User synced',
            isNewUser,
            user: { id, email }
        })
    } catch (error) {
        console.error('[User Sync Error]:', error)
        // Don't fail the request - user sync is non-critical
        return NextResponse.json({
            success: false,
            error: 'Sync failed but continuing',
            details: String(error)
        })
    }
}
