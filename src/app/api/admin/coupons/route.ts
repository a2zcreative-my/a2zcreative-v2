import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    applicable_plans: string | null;
    max_uses: number | null;
    used_count: number;
    valid_from: string | null;
    valid_until: string | null;
    active: number;
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

// GET - List all coupons
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDB();
        if (!db) {
            return NextResponse.json({ coupons: [] });
        }

        const userResult = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const coupons = await db.prepare(
            'SELECT * FROM coupons ORDER BY created_at DESC'
        ).all<Coupon>();

        return NextResponse.json({ coupons: coupons.results || [] });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

// POST - Create new coupon
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
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { code, discount_type, discount_value, applicable_plans, max_uses, valid_from, valid_until } = body;

        if (!code || !discount_type || discount_value === undefined) {
            return NextResponse.json({ error: 'Code, discount type, and value are required' }, { status: 400 });
        }

        await db.prepare(`
            INSERT INTO coupons (code, discount_type, discount_value, applicable_plans, max_uses, valid_from, valid_until)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            code.toUpperCase(),
            discount_type,
            discount_value,
            applicable_plans ? JSON.stringify(applicable_plans) : null,
            max_uses || null,
            valid_from || null,
            valid_until || null
        ).run();

        return NextResponse.json({ success: true, message: 'Coupon created successfully' });
    } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint')) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }
        console.error('Error creating coupon:', error);
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
}

// PUT - Update coupon
export async function PUT(request: NextRequest) {
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
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { id, active } = body;

        if (!id) {
            return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
        }

        // Toggle active status
        await db.prepare(
            'UPDATE coupons SET active = ? WHERE id = ?'
        ).bind(active ? 1 : 0, id).run();

        return NextResponse.json({ success: true, message: 'Coupon updated successfully' });
    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }
}

// DELETE - Delete coupon
export async function DELETE(request: NextRequest) {
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
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first<{ role: string }>();

        if (!userResult || userResult.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
        }

        await db.prepare('DELETE FROM coupons WHERE id = ?').bind(id).run();

        return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }
}

export const runtime = 'edge';
