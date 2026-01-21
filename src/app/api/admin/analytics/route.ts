import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface DailyRevenue {
    date: string;
    revenue: number;
}

interface DailyUsers {
    date: string;
    users: number;
}

interface EventTypeCount {
    type: string;
    count: number;
}

// GET - Fetch analytics data for charts
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { env } = getRequestContext();
        const db = env.DB;

        // Check if user is admin
        const userResult = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get revenue trend (last 30 days)
        const revenueTrend = await db.prepare(`
            SELECT 
                date(created_at) as date,
                SUM(amount) as revenue
            FROM invoices 
            WHERE status = 'paid' 
                AND created_at >= date('now', '-30 days')
            GROUP BY date(created_at)
            ORDER BY date ASC
        `).all<DailyRevenue>();

        // Get user growth (last 30 days)
        const userGrowth = await db.prepare(`
            SELECT 
                date(created_at) as date,
                COUNT(*) as users
            FROM users 
            WHERE created_at >= date('now', '-30 days')
            GROUP BY date(created_at)
            ORDER BY date ASC
        `).all<DailyUsers>();

        // Get event type distribution
        const eventTypes = await db.prepare(`
            SELECT 
                COALESCE(type, 'Other') as type,
                COUNT(*) as count
            FROM events 
            GROUP BY type
            ORDER BY count DESC
            LIMIT 6
        `).all<EventTypeCount>();

        // Calculate conversion rate (users with at least 1 paid invoice)
        const conversionResult = await db.prepare(`
            SELECT 
                COUNT(DISTINCT user_id) as paying_users,
                (SELECT COUNT(*) FROM users) as total_users
            FROM invoices 
            WHERE status = 'paid'
        `).first<{ paying_users: number; total_users: number }>();

        const conversionRate = conversionResult && conversionResult.total_users > 0
            ? (conversionResult.paying_users / conversionResult.total_users * 100).toFixed(1)
            : '0';

        // Average revenue per user
        const avgRevenueResult = await db.prepare(`
            SELECT 
                COALESCE(SUM(amount), 0) as total_revenue,
                (SELECT COUNT(*) FROM users WHERE id IN (SELECT DISTINCT user_id FROM invoices WHERE status = 'paid')) as paying_users
            FROM invoices 
            WHERE status = 'paid'
        `).first<{ total_revenue: number; paying_users: number }>();

        const avgRevenuePerUser = avgRevenueResult && avgRevenueResult.paying_users > 0
            ? (avgRevenueResult.total_revenue / avgRevenueResult.paying_users).toFixed(2)
            : '0';

        return NextResponse.json({
            revenueTrend: revenueTrend.results || [],
            userGrowth: userGrowth.results || [],
            eventTypes: eventTypes.results || [],
            metrics: {
                conversionRate: parseFloat(conversionRate),
                avgRevenuePerUser: parseFloat(avgRevenuePerUser),
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

export const runtime = 'edge';
