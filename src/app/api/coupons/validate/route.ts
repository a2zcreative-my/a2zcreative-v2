import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    applicable_plans: string | null;
    max_uses: number | null;
    used_count: number;
    valid_from: string | null;
    valid_until: string | null;
    active: number;
}

// POST - Validate a coupon code
export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = env.DB;

        const body = await request.json();
        const { code, plan } = body;

        if (!code) {
            return NextResponse.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
        }

        const coupon = await db.prepare(
            'SELECT * FROM coupons WHERE code = ? AND active = 1'
        ).bind(code.toUpperCase()).first<Coupon>();

        if (!coupon) {
            return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
        }

        // Check validity dates
        const now = new Date().toISOString();
        if (coupon.valid_from && now < coupon.valid_from) {
            return NextResponse.json({ valid: false, error: 'Coupon is not yet valid' });
        }
        if (coupon.valid_until && now > coupon.valid_until) {
            return NextResponse.json({ valid: false, error: 'Coupon has expired' });
        }

        // Check usage limits
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
            return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
        }

        // Check applicable plans
        if (coupon.applicable_plans && plan) {
            const plans = JSON.parse(coupon.applicable_plans);
            if (!plans.includes(plan)) {
                return NextResponse.json({ valid: false, error: 'Coupon not valid for this plan' });
            }
        }

        return NextResponse.json({
            valid: true,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            message: coupon.discount_type === 'percentage'
                ? `${coupon.discount_value}% discount applied!`
                : `RM${coupon.discount_value} discount applied!`
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 });
    }
}

export const runtime = 'edge';
