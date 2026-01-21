import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET - Export data as CSV
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        let csv = '';
        let filename = '';

        if (type === 'users') {
            const result = await db.prepare(
                'SELECT id, email, name, phone, plan, role, created_at FROM users ORDER BY created_at DESC'
            ).all();

            csv = 'ID,Email,Name,Phone,Plan,Role,Created At\n';
            csv += (result.results || []).map((row: any) =>
                `"${row.id || ''}","${row.email || ''}","${row.name || ''}","${row.phone || ''}","${row.plan || ''}","${row.role || ''}","${row.created_at || ''}"`
            ).join('\n');
            filename = 'users_export.csv';

        } else if (type === 'events') {
            const result = await db.prepare(
                'SELECT e.id, e.title, e.type, e.event_date, e.status, e.plan, e.views, e.rsvp_count, e.created_at, u.email as owner_email FROM events e LEFT JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC'
            ).all();

            csv = 'ID,Title,Type,Event Date,Status,Plan,Views,RSVP Count,Created At,Owner Email\n';
            csv += (result.results || []).map((row: any) =>
                `"${row.id || ''}","${row.title || ''}","${row.type || ''}","${row.event_date || ''}","${row.status || ''}","${row.plan || ''}","${row.views || 0}","${row.rsvp_count || 0}","${row.created_at || ''}","${row.owner_email || ''}"`
            ).join('\n');
            filename = 'events_export.csv';

        } else if (type === 'invoices') {
            const result = await db.prepare(
                'SELECT id, customer_name, customer_email, amount, status, payment_method, paid_at, created_at FROM invoices ORDER BY created_at DESC'
            ).all();

            csv = 'ID,Customer Name,Customer Email,Amount,Status,Payment Method,Paid At,Created At\n';
            csv += (result.results || []).map((row: any) =>
                `"${row.id || ''}","${row.customer_name || ''}","${row.customer_email || ''}","${row.amount || 0}","${row.status || ''}","${row.payment_method || ''}","${row.paid_at || ''}","${row.created_at || ''}"`
            ).join('\n');
            filename = 'invoices_export.csv';

        } else {
            return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
        }

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error exporting data:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}

export const runtime = 'edge';
