import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'edge'

interface GuestToMessage {
    id: string
    name: string
    email: string
    event?: string
}

interface MessageRequest {
    guests: GuestToMessage[]
    messageType: 'reminder' | 'thankyou' | 'custom'
    subject?: string
    customMessage?: string
    eventName?: string
}

// Email templates
const templates = {
    reminder: (guestName: string, eventName: string) => ({
        subject: `Reminder: Please RSVP for ${eventName} 📩`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0;">A2ZCreative</h1>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 24px;">Hi ${guestName}! 👋</h2>
                    
                    <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        You're invited to <strong style="color: #a78bfa;">${eventName}</strong> and we haven't heard back from you yet!
                    </p>
                    
                    <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                        Please take a moment to let us know if you'll be able to attend. Your response helps us plan the event better.
                    </p>
                    
                    <div style="text-align: center;">
                        <a href="https://a2zcreative.com.my" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                            RSVP Now →
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                    <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 0;">Powered by A2ZCreative</p>
                </div>
            </div>
        `
    }),

    thankyou: (guestName: string, eventName: string) => ({
        subject: `Thank You for Attending ${eventName}! 🎉`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0;">A2ZCreative</h1>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 24px;">Thank You, ${guestName}! 🙏</h2>
                    
                    <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        We are so grateful that you attended <strong style="color: #a78bfa;">${eventName}</strong>. Your presence made the event truly special!
                    </p>
                    
                    <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                        We hope you had a wonderful time. Thank you for celebrating with us! ✨
                    </p>
                    
                    <div style="text-align: center;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                            💚 With Love & Gratitude
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                    <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 0;">Powered by A2ZCreative</p>
                </div>
            </div>
        `
    }),

    custom: (guestName: string, subject: string, message: string) => ({
        subject,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0;">A2ZCreative</h1>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 24px;">Hi ${guestName}! 👋</h2>
                    
                    <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; white-space: pre-wrap;">
                        ${message}
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                    <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 0;">Powered by A2ZCreative</p>
                </div>
            </div>
        `
    })
}

// Helper to get current user
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

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: MessageRequest = await request.json()
        const { guests, messageType, subject, customMessage, eventName } = body

        if (!guests || !Array.isArray(guests) || guests.length === 0) {
            return NextResponse.json({ error: 'No guests provided' }, { status: 400 })
        }

        // Filter guests with valid emails
        const validGuests = guests.filter(g => g.email && g.email.includes('@'))

        if (validGuests.length === 0) {
            return NextResponse.json({ error: 'No valid email addresses found' }, { status: 400 })
        }

        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.log('[Guest Message] RESEND_API_KEY not configured, simulating send...')
            return NextResponse.json({
                success: true,
                sent: validGuests.length,
                failed: 0,
                message: `Simulated: Would send ${messageType} message to ${validGuests.length} guest(s)`
            })
        }

        const resend = new Resend(process.env.RESEND_API_KEY)

        let sent = 0
        let failed = 0
        const errors: string[] = []

        for (const guest of validGuests) {
            try {
                let emailContent

                switch (messageType) {
                    case 'reminder':
                        emailContent = templates.reminder(guest.name, eventName || guest.event || 'Our Event')
                        break
                    case 'thankyou':
                        emailContent = templates.thankyou(guest.name, eventName || guest.event || 'Our Event')
                        break
                    case 'custom':
                        if (!subject || !customMessage) {
                            throw new Error('Custom message requires subject and message')
                        }
                        emailContent = templates.custom(guest.name, subject, customMessage)
                        break
                    default:
                        throw new Error('Invalid message type')
                }

                await resend.emails.send({
                    from: 'A2ZCreative <noreply@resend.dev>',
                    to: guest.email,
                    subject: emailContent.subject,
                    html: emailContent.html
                })

                sent++
                console.log(`[Guest Message] Sent ${messageType} to ${guest.email}`)
            } catch (error) {
                failed++
                errors.push(`${guest.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                console.error(`[Guest Message] Failed to send to ${guest.email}:`, error)
            }
        }

        return NextResponse.json({
            success: failed === 0,
            sent,
            failed,
            message: failed === 0
                ? `Successfully sent ${sent} message(s)`
                : `Sent ${sent}, failed ${failed}`,
            errors: failed > 0 ? errors : undefined
        })
    } catch (error) {
        console.error('[Guest Message Error]:', error)
        return NextResponse.json(
            { error: 'Failed to send messages', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
