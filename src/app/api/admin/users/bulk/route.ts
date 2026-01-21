import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

// Initialize Resend for emails
function getResend() {
    return new Resend(process.env.RESEND_API_KEY);
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

interface BulkActionRequest {
    action: 'change_plan' | 'suspend' | 'activate' | 'send_email';
    user_ids: string[];
    params?: {
        plan?: string;
        subject?: string;
        message?: string;
    };
}

// POST - Execute bulk action
export async function POST(request: NextRequest) {
    try {
        const { isAdmin, adminId, adminEmail } = await verifyAdmin(request);
        if (!isAdmin || !adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: BulkActionRequest = await request.json();
        const { action, user_ids, params } = body;

        if (!action || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return NextResponse.json({ error: 'action and user_ids are required' }, { status: 400 });
        }

        const db = getDB();
        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        // Process each user
        for (const userId of user_ids) {
            try {
                switch (action) {
                    case 'change_plan':
                        if (!params?.plan) {
                            errors.push(`Missing plan for user ${userId}`);
                            failCount++;
                            continue;
                        }
                        await db.prepare(
                            'UPDATE users SET plan = ?, updated_at = datetime("now") WHERE id = ?'
                        ).bind(params.plan, userId).run();

                        // Audit log
                        await db.prepare(`
                            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `).bind(adminId, adminEmail, 'admin.bulk_change_plan', 'user', userId,
                            JSON.stringify({ new_plan: params.plan })).run();
                        successCount++;
                        break;

                    case 'suspend':
                        await db.prepare(
                            'UPDATE users SET status = "suspended", updated_at = datetime("now") WHERE id = ?'
                        ).bind(userId).run();

                        await db.prepare(`
                            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `).bind(adminId, adminEmail, 'admin.bulk_suspend', 'user', userId,
                            JSON.stringify({ status: 'suspended' })).run();
                        successCount++;
                        break;

                    case 'activate':
                        await db.prepare(
                            'UPDATE users SET status = "active", updated_at = datetime("now") WHERE id = ?'
                        ).bind(userId).run();

                        await db.prepare(`
                            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `).bind(adminId, adminEmail, 'admin.bulk_activate', 'user', userId,
                            JSON.stringify({ status: 'active' })).run();
                        successCount++;
                        break;

                    case 'send_email':
                        if (!params?.subject || !params?.message) {
                            errors.push(`Missing subject or message for user ${userId}`);
                            failCount++;
                            continue;
                        }

                        // Get user email
                        const user = await db.prepare(
                            'SELECT email, name FROM users WHERE id = ?'
                        ).bind(userId).first<{ email: string; name: string }>();

                        if (!user?.email) {
                            errors.push(`No email found for user ${userId}`);
                            failCount++;
                            continue;
                        }

                        const resend = getResend();
                        await resend.emails.send({
                            from: 'A2ZCreative <noreply@a2zcreative.my>',
                            to: user.email,
                            subject: params.subject,
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2>Hello${user.name ? ` ${user.name}` : ''},</h2>
                                    <p>${params.message.replace(/\n/g, '<br>')}</p>
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                    <p style="color: #888; font-size: 12px;">
                                        This email was sent from A2ZCreative administration.
                                    </p>
                                </div>
                            `
                        });

                        await db.prepare(`
                            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `).bind(adminId, adminEmail, 'admin.bulk_email', 'user', userId,
                            JSON.stringify({ subject: params.subject })).run();
                        successCount++;
                        break;

                    default:
                        errors.push(`Unknown action: ${action}`);
                        failCount++;
                }
            } catch (error) {
                console.error(`Error processing user ${userId}:`, error);
                errors.push(`Failed to process user ${userId}: ${String(error)}`);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${successCount} user(s) successfully`,
            successCount,
            failCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error executing bulk action:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const runtime = 'edge';
