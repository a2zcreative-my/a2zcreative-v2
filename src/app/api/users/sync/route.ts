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

        // Access D1 binding (available in Cloudflare Workers)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const env = (request as any).cf?.env || (globalThis as any).process?.env
        const db = env?.DB

        if (!db) {
            // Fallback for local development - log and return success
            console.log('[D1 Sync] Local mode - User data:', { id, email, name, phone, plan })
            return NextResponse.json({
                success: true,
                message: 'Skipped (D1 not available in local development)'
            })
        }

        // Upsert user data to D1
        await db.prepare(`
      INSERT INTO users (id, email, name, phone, plan, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        phone = excluded.phone,
        plan = COALESCE(excluded.plan, users.plan),
        updated_at = CURRENT_TIMESTAMP
    `).bind(id, email, name || null, phone || null, plan || 'starter').run()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[D1 Sync Error]:', error)
        return NextResponse.json(
            { error: 'User sync failed', details: String(error) },
            { status: 500 }
        )
    }
}
