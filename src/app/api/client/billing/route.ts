import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// Helper to get current user from Supabase
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

// Helper to get D1 database
function getDB() {
    try {
        const { env } = getRequestContext()
        return env.DB
    } catch {
        // @ts-expect-error - Cloudflare bindings available at runtime
        return globalThis.DB
    }
}

// GET /api/client/billing - Get billing and payment history for current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()

        const emptyResponse = {
            payments: [],
            summary: {
                totalEvents: 0,
                totalSpent: 0,
                lastPlan: 'None'
            }
        }

        if (!db) {
            return NextResponse.json(emptyResponse)
        }

        // Get user's invoices
        const { results: invoices } = await db.prepare(`
            SELECT i.*, e.title as event_title
            FROM invoices i
            LEFT JOIN events e ON i.event_id = e.id
            WHERE i.user_id = ?
            ORDER BY i.created_at DESC
        `).bind(user.id).all()

        // Get user's events count
        const eventCount = await db.prepare(`
            SELECT COUNT(*) as count FROM events WHERE user_id = ?
        `).bind(user.id).first()

        const invoiceList = invoices || []

        // Format payments
        const payments = invoiceList.map((inv: {
            id: string;
            event_title?: string;
            items?: string;
            amount: number;
            created_at?: string;
            status?: string;
            payment_method?: string;
        }) => {
            // Parse items to get plan name
            let planName = 'Event'
            try {
                if (inv.items) {
                    const items = JSON.parse(inv.items)
                    if (items[0]?.name) {
                        planName = items[0].name
                    }
                }
            } catch {
                // Ignore parse errors
            }

            return {
                id: inv.id,
                event: inv.event_title || 'Event Purchase',
                plan: planName,
                amount: inv.amount,
                date: inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
                status: inv.status || 'pending',
                method: inv.payment_method || 'N/A'
            }
        })

        // Calculate summary
        const totalSpent = invoiceList
            .filter((inv: { status?: string }) => inv.status === 'paid')
            .reduce((sum: number, inv: { amount?: number }) => sum + (inv.amount || 0), 0)

        // Get last paid invoice for last plan
        const lastPaidInvoice = invoiceList.find((inv: { status?: string }) => inv.status === 'paid')
        let lastPlan = 'None'
        if (lastPaidInvoice) {
            try {
                const items = JSON.parse((lastPaidInvoice as { items?: string }).items || '[]')
                if (items[0]?.name) {
                    lastPlan = items[0].name.replace(' Pack', '')
                }
            } catch {
                lastPlan = 'Starter'
            }
        }

        return NextResponse.json({
            payments,
            summary: {
                totalEvents: (eventCount as { count?: number })?.count || 0,
                totalSpent,
                lastPlan
            }
        })
    } catch (error) {
        console.error('[Billing API Error]:', error)
        return NextResponse.json({
            payments: [],
            summary: { totalEvents: 0, totalSpent: 0, lastPlan: 'None' }
        })
    }
}
