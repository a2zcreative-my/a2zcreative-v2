import { NextRequest, NextResponse } from 'next/server';
import { billplzConfig } from '@/lib/billplz';
// import crypto from 'crypto'; // Removed for Edge Runtime compatibility

// Verify Billplz webhook signature
// Verify Billplz webhook signature
async function verifySignature(data: Record<string, string>, signature: string): Promise<boolean> {
    // Sort keys alphabetically and build string
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
        .filter(key => key !== 'x_signature')
        .map(key => `${key}${data[key]}`)
        .join('|');

    const encoder = new TextEncoder();
    const keyData = encoder.encode(billplzConfig.xSignature);
    const messageData = encoder.encode(signatureString);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
    try {
        // Parse form data (Billplz sends as form-urlencoded)
        const formData = await request.formData();
        const data: Record<string, string> = {};

        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        console.log('Billplz Callback received:', {
            id: data.id,
            paid: data.paid,
            paid_at: data.paid_at,
        });

        // Verify signature for security
        if (data.x_signature) {
            const isValid = await verifySignature(data, data.x_signature);
            if (!isValid) {
                console.error('Invalid Billplz signature');
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        }

        // Extract payment details
        const billId = data.id;
        const isPaid = data.paid === 'true';
        const paidAt = data.paid_at;

        // Get invoiceId from query params (we appended it in create-bill)
        const url = new URL(request.url);
        const invoiceId = url.searchParams.get('invoiceId');

        if (isPaid && invoiceId) {
            // @ts-expect-error - Cloudflare bindings
            const db = request.cf?.env?.DB || globalThis.DB;

            if (db) {
                try {
                    await db.prepare(`
                        UPDATE invoices 
                        SET status = ?, paid_at = ?, payment_method = ?
                        WHERE id = ?
                    `).bind(
                        'paid',
                        paidAt,
                        'FPX (Billplz)', // Or extract from metadata if available
                        invoiceId
                    ).run();
                    console.log(`✅ Invoice ${invoiceId} marked as paid`);
                } catch (dbError) {
                    console.error('[Callback] Database update failed:', dbError);
                }
            } else {
                console.log(`[Callback] Skip DB update (no binding) for Invoice ${invoiceId}`);
            }
        }


        // Billplz expects a 200 response
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Callback processing error:', error);
        return NextResponse.json(
            { error: 'Callback processing failed' },
            { status: 500 }
        );
    }
}

export const runtime = 'edge';
