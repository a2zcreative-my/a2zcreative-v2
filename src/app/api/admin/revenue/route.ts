import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

function getDB() {
    try {
        const { env } = getRequestContext()
        return env.DB
    } catch {
        // @ts-expect-error - Cloudflare bindings
        return globalThis.DB
    }
}

// GET /api/admin/revenue - Get revenue data for admin
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        // Check admin
        const currentUser = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first() as { role: string } | null

        if (currentUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // Fetch all revenue data in batch
        const results = await db.batch([
            db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'`),
            db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid' AND created_at >= date('now', 'start of month')`),
            db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'pending'`),
            db.prepare(`
                SELECT i.id, i.amount, i.status, i.created_at,
                       COALESCE(u.name, u.email, 'Unknown') as user_name, u.email,
                       COALESCE(e.plan, 'starter') as plan
                FROM invoices i
                LEFT JOIN users u ON i.user_id = u.id
                LEFT JOIN events e ON i.event_id = e.id
                ORDER BY i.created_at DESC
                LIMIT 20
            `),
            db.prepare(`
                SELECT 
                    COALESCE(e.plan, 'starter') as plan,
                    COUNT(*) as count,
                    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as revenue
                FROM invoices i
                LEFT JOIN events e ON i.event_id = e.id
                GROUP BY COALESCE(e.plan, 'starter')
            `)
        ])

        const [
            totalRevenueResult,
            thisMonthResult,
            pendingResult,
            transactionsResult,
            planBreakdownResult
        ] = results || []

        const stats = {
            totalRevenue: (totalRevenueResult.results?.[0] as any)?.total || 0,
            thisMonth: (thisMonthResult.results?.[0] as any)?.total || 0,
            pending: (pendingResult.results?.[0] as any)?.total || 0
        }

        const transactions = (transactionsResult.results || []).map((t: any) => ({
            id: t.id,
            user: t.user_name || 'Unknown',
            email: t.email || '',
            plan: t.plan || 'Starter',
            amount: t.amount || 0,
            date: t.created_at,
            status: t.status || 'pending'
        }))

        const planBreakdown = (planBreakdownResult.results || []).map((p: any) => ({
            plan: (p.plan || 'starter').charAt(0).toUpperCase() + (p.plan || 'starter').slice(1),
            count: p.count || 0,
            revenue: p.revenue || 0
        }))

        // Calculate percentages
        const totalPlanRevenue = planBreakdown.reduce((sum: number, p: any) => sum + p.revenue, 0)
        const planBreakdownWithPercentage = planBreakdown.map((p: any) => ({
            ...p,
            percentage: totalPlanRevenue > 0 ? Math.round((p.revenue / totalPlanRevenue) * 100) : 0
        }))

        return NextResponse.json({
            stats,
            transactions,
            planBreakdown: planBreakdownWithPercentage
        })
    } catch (error) {
        console.error('[Admin Revenue Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
