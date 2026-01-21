import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createClient } from '@supabase/supabase-js';

// Helper to get DB
function getDB() {
    const ctx = getRequestContext();
    return ctx.env.DB;
}

// Helper to create Supabase client
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// Helper to verify admin
async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; adminId: string | null; adminEmail: string | null }> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { isAdmin: false, adminId: null, adminEmail: null };
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseAdmin();

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return { isAdmin: false, adminId: null, adminEmail: null };
    }

    const db = getDB();
    const result = await db.prepare('SELECT role, email FROM users WHERE id = ?').bind(user.id).first<{ role: string; email: string }>();

    return {
        isAdmin: result?.role === 'admin',
        adminId: user.id,
        adminEmail: result?.email || user.email || null
    };
}

// GET - Get current impersonation status
export async function GET(request: NextRequest) {
    try {
        const { isAdmin, adminId } = await verifyAdmin(request);
        if (!isAdmin || !adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for impersonation cookie
        const impersonatedUserId = request.cookies.get('impersonated_user_id')?.value;
        const originalAdminId = request.cookies.get('original_admin_id')?.value;

        if (!impersonatedUserId) {
            return NextResponse.json({ isImpersonating: false });
        }

        const db = getDB();
        const impersonatedUser = await db.prepare(
            'SELECT id, email, name, plan, role FROM users WHERE id = ?'
        ).bind(impersonatedUserId).first();

        return NextResponse.json({
            isImpersonating: true,
            impersonatedUser,
            originalAdminId
        });
    } catch (error) {
        console.error('Error getting impersonation status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Start impersonation
export async function POST(request: NextRequest) {
    try {
        const { isAdmin, adminId, adminEmail } = await verifyAdmin(request);
        if (!isAdmin || !adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const db = getDB();

        // Get the target user
        const targetUser = await db.prepare(
            'SELECT id, email, name, plan, role FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Log the impersonation action
        await db.prepare(`
            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            adminId,
            adminEmail,
            'admin.impersonate_start',
            'user',
            userId,
            JSON.stringify({ impersonated_email: (targetUser as any).email })
        ).run();

        // Create response with cookies
        const response = NextResponse.json({
            success: true,
            impersonatedUser: targetUser,
            message: `Now viewing as ${(targetUser as any).name || (targetUser as any).email}`
        });

        // Set impersonation cookies (secure, httpOnly, 1 hour expiry)
        response.cookies.set('impersonated_user_id', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600 // 1 hour
        });

        response.cookies.set('original_admin_id', adminId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600 // 1 hour
        });

        return response;
    } catch (error) {
        console.error('Error starting impersonation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Stop impersonation
export async function DELETE(request: NextRequest) {
    try {
        const impersonatedUserId = request.cookies.get('impersonated_user_id')?.value;
        const originalAdminId = request.cookies.get('original_admin_id')?.value;

        if (!impersonatedUserId || !originalAdminId) {
            return NextResponse.json({ error: 'Not currently impersonating' }, { status: 400 });
        }

        const authHeader = request.headers.get('authorization');
        let adminEmail = null;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const supabase = getSupabaseAdmin();
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                adminEmail = user.email;
            }
        }

        const db = getDB();

        // Log the stop impersonation action
        await db.prepare(`
            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            originalAdminId,
            adminEmail,
            'admin.impersonate_stop',
            'user',
            impersonatedUserId,
            JSON.stringify({ duration: 'session_ended' })
        ).run();

        // Create response and clear cookies
        const response = NextResponse.json({
            success: true,
            message: 'Impersonation ended'
        });

        response.cookies.delete('impersonated_user_id');
        response.cookies.delete('original_admin_id');

        return response;
    } catch (error) {
        console.error('Error stopping impersonation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const runtime = 'edge';
