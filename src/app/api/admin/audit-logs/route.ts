import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface AuditLog {
    id: string;
    admin_id: string;
    admin_email: string;
    action: string;
    target_type: string | null;
    target_id: string | null;
    details: string | null;
    created_at: string;
}

function getDB() {
    try {
        const { env } = getRequestContext();
        return env.DB;
    } catch {
        return null;
    }
}

// GET - List audit logs with pagination
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDB();
        if (!db) {
            return NextResponse.json({ logs: [] });
        }

        const userResult = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get query params for pagination and filtering
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const action = searchParams.get('action');
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params: any[] = [];

        if (action) {
            query += ' AND action LIKE ?';
            params.push(`${action}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const stmt = db.prepare(query);
        const logs = await (params.length > 2
            ? stmt.bind(...params).all<AuditLog>()
            : stmt.bind(limit, offset).all<AuditLog>());

        // Get total count
        const countResult = await db.prepare('SELECT COUNT(*) as count FROM audit_logs').first<{ count: number }>();

        return NextResponse.json({
            logs: logs.results || [],
            total: countResult?.count || 0,
            page,
            limit
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

// POST - Create an audit log entry (internal use)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDB();
        if (!db) {
            return NextResponse.json({ error: 'D1 not available' }, { status: 503 });
        }

        const userResult = await db.prepare(
            'SELECT role, email FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string; email: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { action, target_type, target_id, details } = body;

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        await db.prepare(`
            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            user.id,
            userResult.email,
            action,
            target_type || null,
            target_id || null,
            details ? JSON.stringify(details) : null
        ).run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating audit log:', error);
        return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
    }
}

export const runtime = 'edge';
