import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

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

// GET /api/admin/stats - Get admin dashboard stats
export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated and is admin
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 })
        }

        // Check if current user is admin
        const currentUser = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first() as { role: string } | null

        if (currentUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // Fetch all stats in parallel using batch
        const [
            totalRevenueResult,
            totalUsersResult,
            newUsersResult,
            totalEventsResult,
            activeEventsResult,
            totalInvoicesResult,
            pendingPaymentsResult,
            recentTransactionsResult,
            topUsersResult
        ] = await db.batch([
            // Total revenue (paid invoices)
            db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'`),
            // Total users
            db.prepare(`SELECT COUNT(*) as count FROM users`),
            // New users this month
            db.prepare(`SELECT COUNT(*) as count FROM users WHERE created_at >= date('now', 'start of month')`),
            // Total events
            db.prepare(`SELECT COUNT(*) as count FROM events`),
            // Active (published) events
            db.prepare(`SELECT COUNT(*) as count FROM events WHERE status = 'published'`),
            // Total invoices
            db.prepare(`SELECT COUNT(*) as count FROM invoices`),
            // Pending payments
            db.prepare(`SELECT COUNT(*) as count FROM invoices WHERE status = 'pending'`),
            // Recent transactions (last 5)
            db.prepare(`
                SELECT i.id, i.amount, i.status, i.created_at,
                       COALESCE(u.name, u.email, 'Unknown') as user_name
                FROM invoices i
                LEFT JOIN users u ON i.user_id = u.id
                ORDER BY i.created_at DESC
                LIMIT 5
            `),
            // Top users by revenue
            db.prepare(`
                SELECT u.id, COALESCE(u.name, u.email) as name, 
                       COUNT(DISTINCT e.id) as event_count,
                       COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as total_revenue
                FROM users u
                LEFT JOIN events e ON e.user_id = u.id
                LEFT JOIN invoices i ON i.user_id = u.id
                WHERE u.role = 'client'
                GROUP BY u.id
                ORDER BY total_revenue DESC
                LIMIT 5
            `)
        ])

        // Extract values from results
        const stats = {
            totalRevenue: (totalRevenueResult.results?.[0] as any)?.total || 0,
            totalUsers: (totalUsersResult.results?.[0] as any)?.count || 0,
            newUsersThisMonth: (newUsersResult.results?.[0] as any)?.count || 0,
            totalEvents: (totalEventsResult.results?.[0] as any)?.count || 0,
            activeEvents: (activeEventsResult.results?.[0] as any)?.count || 0,
            totalInvoices: (totalInvoicesResult.results?.[0] as any)?.count || 0,
            pendingPayments: (pendingPaymentsResult.results?.[0] as any)?.count || 0
        }

        const recentTransactions = (recentTransactionsResult.results || []).map((tx: any) => ({
            id: tx.id,
            user: tx.user_name,
            amount: tx.amount,
            date: tx.created_at,
            status: tx.status
        }))

        const topUsers = (topUsersResult.results || []).map((u: any) => ({
            name: u.name || 'Unknown',
            events: u.event_count || 0,
            revenue: u.total_revenue || 0
        }))

        return NextResponse.json({
            stats,
            recentTransactions,
            topUsers
        })
    } catch (error) {
        console.error('[Admin Stats Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
