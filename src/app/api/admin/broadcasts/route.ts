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

// Initialize Resend
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

// GET - List all broadcasts
export async function GET(request: NextRequest) {
    try {
        const { isAdmin } = await verifyAdmin(request);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDB();
        const broadcasts = await db.prepare(`
            SELECT b.*, u.name as admin_name, u.email as admin_email
            FROM broadcasts b
            LEFT JOIN users u ON b.admin_id = u.id
            ORDER BY b.created_at DESC
            LIMIT 50
        `).all();

        return NextResponse.json({ broadcasts: broadcasts.results || [] });
    } catch (error) {
        console.error('Error fetching broadcasts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Send new broadcast
export async function POST(request: NextRequest) {
    try {
        const { isAdmin, adminId, adminEmail } = await verifyAdmin(request);
        if (!isAdmin || !adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subject, body: messageBody, segment } = body;

        if (!subject || !messageBody) {
            return NextResponse.json({ error: 'subject and body are required' }, { status: 400 });
        }

        const db = getDB();

        // Build user query based on segment
        let userQuery = 'SELECT id, email, name FROM users WHERE role = "client"';
        const segmentValue = segment || 'all';

        if (segmentValue.startsWith('plan:')) {
            const plan = segmentValue.replace('plan:', '');
            userQuery += ` AND plan = "${plan}"`;
        } else if (segmentValue === 'active') {
            // Active = logged in within last 30 days
            userQuery += ` AND last_login > datetime('now', '-30 days')`;
        } else if (segmentValue === 'inactive') {
            // Inactive = not logged in for 30+ days
            userQuery += ` AND (last_login IS NULL OR last_login < datetime('now', '-30 days'))`;
        }
        // 'all' = no additional filter

        const users = await db.prepare(userQuery).all<{ id: string; email: string; name: string }>();
        const recipients = users.results || [];

        if (recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients match this segment' }, { status: 400 });
        }

        // Send emails via Resend
        const resend = getResend();
        let sentCount = 0;
        const errors: string[] = [];

        // Send in batches of 10
        const batchSize = 10;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);

            await Promise.allSettled(
                batch.map(async (recipient: { id: string; email: string; name: string }) => {
                    try {
                        await resend.emails.send({
                            from: 'A2ZCreative <noreply@a2zcreative.my>',
                            to: recipient.email,
                            subject: subject,
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <h1 style="color: #8B5CF6; margin: 0;">A2ZCreative</h1>
                                    </div>
                                    <h2 style="color: #333;">${subject}</h2>
                                    <div style="color: #555; line-height: 1.6;">
                                        ${messageBody.replace(/\n/g, '<br>')}
                                    </div>
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                    <p style="color: #888; font-size: 12px; text-align: center;">
                                        You're receiving this because you're a valued A2ZCreative member.<br>
                                        <a href="https://a2zcreative.my" style="color: #8B5CF6;">Visit A2ZCreative</a>
                                    </p>
                                </div>
                            `
                        });
                        sentCount++;
                    } catch (err) {
                        errors.push(`Failed to send to ${recipient.email}: ${String(err)}`);
                    }
                })
            );
        }

        // Save broadcast record
        const broadcastId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
        await db.prepare(`
            INSERT INTO broadcasts (id, admin_id, subject, body, segment, recipient_count, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            broadcastId,
            adminId,
            subject,
            messageBody,
            segmentValue,
            sentCount,
            sentCount > 0 ? 'sent' : 'failed'
        ).run();

        // Audit log
        await db.prepare(`
            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            adminId,
            adminEmail,
            'admin.broadcast_sent',
            'broadcast',
            broadcastId,
            JSON.stringify({ subject, segment: segmentValue, recipient_count: sentCount })
        ).run();

        return NextResponse.json({
            success: true,
            message: `Broadcast sent to ${sentCount} recipient(s)`,
            broadcastId,
            recipientCount: sentCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const runtime = 'edge';
