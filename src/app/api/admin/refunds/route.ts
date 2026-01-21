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

interface Invoice {
    id: string;
    user_id: string;
    customer_name: string;
    customer_email: string;
    amount: number;
    status: string;
}

// GET - List all refunds
export async function GET(request: NextRequest) {
    try {
        const { isAdmin } = await verifyAdmin(request);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDB();
        const refunds = await db.prepare(`
            SELECT 
                r.*,
                i.customer_name,
                i.customer_email,
                i.amount as original_amount,
                u.name as admin_name,
                u.email as admin_email
            FROM refunds r
            LEFT JOIN invoices i ON r.invoice_id = i.id
            LEFT JOIN users u ON r.admin_id = u.id
            ORDER BY r.created_at DESC
            LIMIT 100
        `).all();

        return NextResponse.json({ refunds: refunds.results || [] });
    } catch (error) {
        console.error('Error fetching refunds:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Process a refund
export async function POST(request: NextRequest) {
    try {
        const { isAdmin, adminId, adminEmail } = await verifyAdmin(request);
        if (!isAdmin || !adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { invoice_id, amount, reason } = body;

        if (!invoice_id || !amount) {
            return NextResponse.json({ error: 'invoice_id and amount are required' }, { status: 400 });
        }

        const db = getDB();

        // Get the invoice
        const invoice = await db.prepare(
            'SELECT * FROM invoices WHERE id = ?'
        ).bind(invoice_id).first<Invoice>();

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.status !== 'paid') {
            return NextResponse.json({ error: 'Can only refund paid invoices' }, { status: 400 });
        }

        if (amount > invoice.amount) {
            return NextResponse.json({ error: 'Refund amount cannot exceed invoice amount' }, { status: 400 });
        }

        // Create refund record
        const refundId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
        await db.prepare(`
            INSERT INTO refunds (id, invoice_id, admin_id, amount, reason, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(refundId, invoice_id, adminId, amount, reason || null, 'processed').run();

        // Update invoice status
        const newStatus = amount >= invoice.amount ? 'refunded' : 'partial_refund';
        await db.prepare(`
            UPDATE invoices SET status = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(newStatus, invoice_id).run();

        // Send refund confirmation email
        if (invoice.customer_email) {
            try {
                const resend = getResend();
                await resend.emails.send({
                    from: 'A2ZCreative <noreply@a2zcreative.my>',
                    to: invoice.customer_email,
                    subject: `Refund Processed - Invoice #${invoice_id.slice(0, 8).toUpperCase()}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #8B5CF6; margin: 0;">A2ZCreative</h1>
                            </div>
                            <h2 style="color: #333;">Refund Confirmation</h2>
                            <p style="color: #555;">Hello ${invoice.customer_name || 'Valued Customer'},</p>
                            <p style="color: #555;">
                                We've processed a refund for your invoice. Here are the details:
                            </p>
                            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0 0 10px 0;"><strong>Invoice ID:</strong> #${invoice_id.slice(0, 8).toUpperCase()}</p>
                                <p style="margin: 0 0 10px 0;"><strong>Refund Amount:</strong> RM ${amount.toFixed(2)}</p>
                                ${reason ? `<p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
                            </div>
                            <p style="color: #555;">
                                The refund will be credited back to your original payment method within 5-10 business days.
                            </p>
                            <p style="color: #555;">
                                If you have any questions, please contact our support team.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="color: #888; font-size: 12px; text-align: center;">
                                Thank you for using A2ZCreative.<br>
                                <a href="https://a2zcreative.my" style="color: #8B5CF6;">Visit A2ZCreative</a>
                            </p>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.error('Failed to send refund email:', emailErr);
            }
        }

        // Audit log
        await db.prepare(`
            INSERT INTO audit_logs (admin_id, admin_email, action, target_type, target_id, details)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            adminId,
            adminEmail,
            'admin.refund_processed',
            'invoice',
            invoice_id,
            JSON.stringify({ refund_id: refundId, amount, reason, original_amount: invoice.amount })
        ).run();

        return NextResponse.json({
            success: true,
            message: `Refund of RM ${amount.toFixed(2)} processed successfully`,
            refundId,
            newInvoiceStatus: newStatus
        });
    } catch (error) {
        console.error('Error processing refund:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const runtime = 'edge';
