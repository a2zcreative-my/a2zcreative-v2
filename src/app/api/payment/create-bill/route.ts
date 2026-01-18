import { NextRequest, NextResponse } from 'next/server';
import { billplzConfig, validateBillplzConfig } from '@/lib/billplz';

interface CreateBillRequest {
    eventId: string;
    amount: number;  // in cents (RM 99 = 9900)
    email: string;
    name: string;
    phone?: string;
    description: string;
    userId: string; // Required for linking invoice
    items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
}

function generateInvoiceId() {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `INV-${year}-${random}`;
}

export async function POST(request: NextRequest) {
    // Validate config
    if (!validateBillplzConfig()) {
        return NextResponse.json(
            { error: 'Payment gateway not configured' },
            { status: 500 }
        );
    }

    try {
        const body: CreateBillRequest = await request.json();
        const { eventId, amount, email, name, phone, description, userId, items } = body;

        // Validate required fields
        if (!eventId || !amount || !email || !name) {
            return NextResponse.json(
                { error: 'Missing required fields: eventId, amount, email, name' },
                { status: 400 }
            );
        }

        // Create Basic Auth header
        const authHeader = btoa(`${billplzConfig.apiKey}:`);

        // Build callback and redirect URLs
        // Generate Invoice ID
        const invoiceId = generateInvoiceId();

        // Save pending invoice to D1
        // @ts-expect-error - Cloudflare bindings
        const db = request.cf?.env?.DB || globalThis.DB;

        if (db) {
            try {
                await db.prepare(`
                    INSERT INTO invoices (
                        id, user_id, event_id, customer_name, customer_email, customer_phone, 
                        amount, status, description, items, due_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    invoiceId,
                    userId || 'guest',
                    eventId,
                    name,
                    email,
                    phone || null,
                    amount / 100, // Convert back to RM
                    'pending',
                    description,
                    JSON.stringify(items || []),
                    new Date().toISOString().split('T')[0] // Due today
                ).run();
                console.log(`[Invoice] Created pending invoice: ${invoiceId}`);
            } catch (dbError) {
                console.error('[Invoice] Failed to save pending invoice:', dbError);
                // Continue to create bill anyway? Or fail? 
                // Let's log but continue for now, though ideally we Want it recorded.
            }
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const callbackUrl = `${baseUrl}/api/payment/callback?invoiceId=${invoiceId}`;
        const redirectUrl = `${baseUrl}/api/payment/redirect?eventId=${eventId}&invoiceId=${invoiceId}`;

        // Create bill via Billplz API
        const response = await fetch(`${billplzConfig.baseUrl}/bills`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                collection_id: billplzConfig.collectionId,
                email: email,
                mobile: phone || null,
                name: name,
                amount: amount, // Amount in cents
                callback_url: callbackUrl,
                redirect_url: redirectUrl,
                description: description,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Billplz API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to create payment bill' },
                { status: response.status }
            );
        }

        const billData = await response.json();

        // Return the bill URL for client redirect
        return NextResponse.json({
            success: true,
            billId: billData.id,
            billUrl: billData.url,
        });

    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';
