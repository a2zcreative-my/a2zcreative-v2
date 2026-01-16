import { NextRequest, NextResponse } from 'next/server';
import { billplzConfig } from '@/lib/billplz';
import crypto from 'crypto';

// Verify Billplz webhook signature
function verifySignature(data: Record<string, string>, signature: string): boolean {
    // Sort keys alphabetically and build string
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
        .filter(key => key !== 'x_signature')
        .map(key => `${key}${data[key]}`)
        .join('|');

    const expectedSignature = crypto
        .createHmac('sha512', billplzConfig.xSignature)
        .update(signatureString)
        .digest('hex');

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
            const isValid = verifySignature(data, data.x_signature);
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
