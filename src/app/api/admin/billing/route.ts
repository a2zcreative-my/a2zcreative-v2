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

// GET /api/admin/billing - Get platform-wide billing and revenue data
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()

        const emptyResponse = {
            invoices: [],
            summary: {
                totalRevenue: 0,
                pendingRevenue: 0,
                totalInvoices: 0,
                paidInvoices: 0,
                pendingInvoices: 0
            },
            planBreakdown: [],
            recentPayments: []
        }

        if (!db) {
            return NextResponse.json(emptyResponse)
        }

        // Check if user is admin
        const userRecord = await db.prepare(`
            SELECT role FROM users WHERE id = ?
        `).bind(user.id).first()

        if (!userRecord || (userRecord as { role?: string }).role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }

        // Get all invoices with user info
        const { results: invoices } = await db.prepare(`
            SELECT i.*, u.name as user_name, u.email as user_email, e.title as event_title
            FROM invoices i
            LEFT JOIN users u ON i.user_id = u.id
            LEFT JOIN events e ON i.event_id = e.id
            ORDER BY i.created_at DESC
            LIMIT 100
        `).all()

        const invoiceList = invoices || []

        // Calculate summary
        const totalRevenue = invoiceList
            .filter((inv: { status?: string }) => inv.status === 'paid')
            .reduce((sum: number, inv: { amount?: number }) => sum + (inv.amount || 0), 0)

        const pendingRevenue = invoiceList
            .filter((inv: { status?: string }) => inv.status === 'pending')
            .reduce((sum: number, inv: { amount?: number }) => sum + (inv.amount || 0), 0)

        const paidInvoices = invoiceList.filter((inv: { status?: string }) => inv.status === 'paid').length
        const pendingInvoices = invoiceList.filter((inv: { status?: string }) => inv.status === 'pending').length

        // Plan breakdown
        const planCounts: Record<string, { count: number; revenue: number }> = {}
        invoiceList.forEach((inv: { items?: string; amount?: number; status?: string }) => {
            let planName = 'Other'
            try {
                if (inv.items) {
                    const items = JSON.parse(inv.items)
                    if (items[0]?.name) {
                        planName = items[0].name.replace(' Pack', '')
                    }
                }
            } catch {
                // Ignore parse errors
            }
            if (!planCounts[planName]) {
                planCounts[planName] = { count: 0, revenue: 0 }
            }
            planCounts[planName].count++
            if (inv.status === 'paid') {
                planCounts[planName].revenue += inv.amount || 0
            }
        })

        const planBreakdown = Object.entries(planCounts).map(([name, data]) => ({
            name,
            count: data.count,
            revenue: data.revenue
        }))

        // Format invoices for response
        const formattedInvoices = invoiceList.map((inv: {
            id: string;
            user_name?: string;
            user_email?: string;
            event_title?: string;
            items?: string;
            amount: number;
            created_at?: string;
            status?: string;
            payment_method?: string;
        }) => {
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
                user: inv.user_name || inv.user_email || 'Unknown',
                event: inv.event_title || 'N/A',
                plan: planName,
                amount: inv.amount,
                date: inv.created_at || '',
                status: inv.status || 'pending',
                method: inv.payment_method || 'N/A'
            }
        })

        // Recent payments (last 5 paid)
        const recentPayments = formattedInvoices
            .filter((inv: { status: string }) => inv.status === 'paid')
            .slice(0, 5)

        return NextResponse.json({
            invoices: formattedInvoices,
            summary: {
                totalRevenue,
                pendingRevenue,
                totalInvoices: invoiceList.length,
                paidInvoices,
                pendingInvoices
            },
            planBreakdown,
            recentPayments
        })
    } catch (error) {
        console.error('[Admin Billing API Error]:', error)
        return NextResponse.json({
            invoices: [],
            summary: { totalRevenue: 0, pendingRevenue: 0, totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0 },
            planBreakdown: [],
            recentPayments: []
        })
    }
}
