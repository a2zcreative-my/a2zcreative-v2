import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface Invoice {
    id: string;
    user_id: string;
    event_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    amount: number;
    status: string;
    payment_method: string;
    paid_at: string;
    items: string; // JSON string
    due_date: string;
    created_at: string;
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // Await params first (Next.js 15+ requirement)
    const { id } = await context.params;

    try {
        // @ts-expect-error - Cloudflare bindings
        const db = request.cf?.env?.DB || globalThis.DB;

        if (!db) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        const invoice = await db.prepare(
            'SELECT * FROM invoices WHERE id = ?'
        ).bind(id).first<Invoice>();

        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Parse items JSON
        let items = [];
        try {
            items = JSON.parse(invoice.items || '[]');
        } catch (e) {
            console.error('Failed to parse invoice items:', e);
        }

        return NextResponse.json({
            ...invoice,
            items
        });

    } catch (error) {
        console.error('Fetch invoice error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
