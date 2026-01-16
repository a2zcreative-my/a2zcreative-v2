import { NextRequest, NextResponse } from 'next/server';
import { billplzConfig, validateBillplzConfig } from '@/lib/billplz';

interface CreateBillRequest {
    eventId: string;
    amount: number;  // in cents (RM 99 = 9900)
    email: string;
    name: string;
    phone?: string;
    description: string;
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
        const { eventId, amount, email, name, phone, description } = body;

        // Validate required fields
        if (!eventId || !amount || !email || !name) {
            return NextResponse.json(
                { error: 'Missing required fields: eventId, amount, email, name' },
                { status: 400 }
            );
        }

        // Create Basic Auth header
        const authHeader = Buffer.from(`${billplzConfig.apiKey}:`).toString('base64');

        // Build callback and redirect URLs
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const callbackUrl = `${baseUrl}/api/payment/callback`;
        const redirectUrl = `${baseUrl}/api/payment/redirect?eventId=${eventId}`;

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
