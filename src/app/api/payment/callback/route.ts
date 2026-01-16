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

        if (isPaid) {
            // TODO: Update your database here
            // Example: await db.payments.update({ billId, status: 'paid', paidAt })
            console.log(`✅ Payment successful: Bill ${billId} paid at ${paidAt}`);

            // For now, we'll log the success
            // In production, you would update the event status in your database
        } else {
            console.log(`❌ Payment not completed: Bill ${billId}`);
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
