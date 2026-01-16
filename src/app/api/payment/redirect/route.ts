import { NextRequest, NextResponse } from 'next/server';
import { billplzConfig } from '@/lib/billplz';
import crypto from 'crypto';

// Verify Billplz redirect signature
function verifySignature(params: URLSearchParams): boolean {
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
        if (key.startsWith('billplz[') && key !== 'billplz[x_signature]') {
            data[key] = value;
        }
    });

    const signature = params.get('billplz[x_signature]');
    if (!signature) return false;

    // Sort keys alphabetically and build string
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
        .map(key => `${key.replace('billplz[', '').replace(']', '')}${data[key]}`)
        .join('|');

    const expectedSignature = crypto
        .createHmac('sha512', billplzConfig.xSignature)
        .update(signatureString)
        .digest('hex');

    return signature === expectedSignature;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // Get Billplz parameters
    const billId = searchParams.get('billplz[id]');
    const isPaid = searchParams.get('billplz[paid]') === 'true';
    const eventId = searchParams.get('eventId') || 'new';

    console.log('Payment redirect:', { billId, isPaid, eventId });

    // Verify signature (optional but recommended)
    const isValidSignature = verifySignature(searchParams);
    if (!isValidSignature) {
        console.warn('Invalid redirect signature - proceeding with caution');
        // In production, you might want to re-verify via API call
    }

    // Redirect based on payment status
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (isPaid) {
        // Payment successful - redirect to send page
        return NextResponse.redirect(`${baseUrl}/events/${eventId}/send?payment=success`);
    } else {
        // Payment failed or cancelled - redirect back to payment page
        return NextResponse.redirect(`${baseUrl}/events/${eventId}/payment?payment=failed`);
    }
}

export const runtime = 'edge';
