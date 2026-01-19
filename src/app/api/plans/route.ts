import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

function getDB() {
    try {
        const { env } = getRequestContext()
        return env.DB
    } catch {
        // @ts-expect-error - Cloudflare bindings available at runtime
        return globalThis.DB
    }
}

// GET /api/plans - List all active plans (public)
export async function GET() {
    try {
        const db = getDB()
        if (!db) {
            // Return default plans if D1 not available
            return NextResponse.json({
                plans: [],
                message: 'D1 not available, using defaults'
            })
        }

        const { results } = await db.prepare(`
            SELECT id, name, price, price_note, tagline, color, gradient, icon, 
                   events, features, not_included, popular, sort_order
            FROM plans
            WHERE active = 1
            ORDER BY sort_order ASC
        `).all()

        // Parse JSON fields
        const plans = (results || []).map((plan: Record<string, unknown>) => ({
            ...plan,
            events: JSON.parse((plan.events as string) || '[]'),
            features: JSON.parse((plan.features as string) || '[]'),
            notIncluded: JSON.parse((plan.not_included as string) || '[]'),
            popular: plan.popular === 1,
        }))

        return NextResponse.json({ plans })
    } catch (error) {
        console.error('[Plans API Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
