import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface UserSyncRequest {
    id: string
    email: string
    name?: string
    phone?: string
    plan?: string
}

export async function POST(request: NextRequest) {
    try {
        const body: UserSyncRequest = await request.json()
        const { id, email, name, phone, plan } = body

        if (!id || !email) {
            return NextResponse.json(
                { error: 'Missing required fields: id, email' },
                { status: 400 }
            )
        }

        // Access D1 binding from Cloudflare environment
        // @ts-expect-error - Cloudflare bindings available at runtime
        const db = request.cf?.env?.DB || globalThis.DB

        if (!db) {
            // D1 not available - log but don't fail
            console.log('[User Sync] D1 not bound, skipping sync:', { id, email, name })
            return NextResponse.json({
                success: true,
                message: 'Sync skipped (D1 not configured)',
                user: { id, email }
            })
        }

        // Upsert user to D1
        await db.prepare(`
            INSERT INTO users (id, email, name, phone, plan, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                email = excluded.email,
                name = COALESCE(excluded.name, users.name),
                phone = COALESCE(excluded.phone, users.phone),
                plan = COALESCE(excluded.plan, users.plan),
                updated_at = datetime('now')
        `).bind(id, email, name || null, phone || null, plan || 'starter').run()

        return NextResponse.json({
            success: true,
            message: 'User synced to D1',
            user: { id, email }
        })
    } catch (error) {
        console.error('[User Sync Error]:', error)
        // Don't fail the request - user sync is non-critical
        return NextResponse.json({
            success: false,
            error: 'Sync failed but continuing',
            details: String(error)
        })
    }
}
