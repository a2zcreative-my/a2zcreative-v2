import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'edge'

interface Guest {
    id: number | string
    name: string
    email: string
    event: string
}

interface SendRemindersRequest {
    guests: Guest[]
}

interface EmailResult {
    id: number | string
    email: string
    success: boolean
    error?: string
}

export async function POST(request: NextRequest) {
    try {
        const body: SendRemindersRequest = await request.json()
        const { guests } = body

        if (!guests || !Array.isArray(guests) || guests.length === 0) {
            return NextResponse.json(
                { error: 'No guests provided', success: false },
                { status: 400 }
            )
        }

        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.log('[RSVP Reminder] RESEND_API_KEY not configured, simulating send...')
            return NextResponse.json({
                success: true,
                sent: guests.length,
                failed: 0,
                results: guests.map(g => ({ id: g.id, email: g.email, success: true })),
                message: 'Simulated send (RESEND_API_KEY not configured)'
            })
        }

        // Initialize Resend inside the function to avoid edge runtime issues
        const resend = new Resend(process.env.RESEND_API_KEY)

        const results: EmailResult[] = []
        let sent = 0
        let failed = 0

        // Send emails to each guest
        for (const guest of guests) {
            try {
                await resend.emails.send({
                    from: 'A2ZCreative <reminders@resend.dev>', // Update with your verified domain
                    to: guest.email,
                    subject: `Reminder: Please RSVP for ${guest.event} 📩`,
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 16px;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <h1 style="color: #ffffff; font-size: 28px; margin: 0;">A2ZCreative</h1>
                            </div>
                            
                            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
                                <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 24px;">Hi ${guest.name}! 👋</h2>
                                
                                <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                    You're invited to <strong style="color: #a78bfa;">${guest.event}</strong> and we haven't heard back from you yet!
                                </p>
                                
                                <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                                    Please take a moment to let us know if you'll be able to attend. Your response helps us plan the event better.
                                </p>
                                
                                <div style="text-align: center;">
                                    <a href="https://a2zcreative.com.my/rsvp" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                        RSVP Now →
                                    </a>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 32px;">
                                <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 0;">
                                    Powered by A2ZCreative
                                </p>
                            </div>
                        </div>
                    `
                })

                results.push({ id: guest.id, email: guest.email, success: true })
                sent++
                console.log(`[RSVP Reminder] Sent to ${guest.email}`)
            } catch (emailError) {
                const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
                results.push({ id: guest.id, email: guest.email, success: false, error: errorMessage })
                failed++
                console.error(`[RSVP Reminder] Failed to send to ${guest.email}:`, emailError)
            }
        }

        return NextResponse.json({
            success: failed === 0,
            sent,
            failed,
            results,
            message: failed === 0
                ? `Successfully sent ${sent} reminder(s)`
                : `Sent ${sent}, failed ${failed}`
        })
    } catch (error) {
        console.error('[RSVP Reminder Error]:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send reminders',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
