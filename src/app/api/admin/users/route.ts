import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// Helper to get D1 database
function getDB() {
    try {
        const { env } = getRequestContext()
        return env.DB
    } catch {
        // @ts-expect-error - Cloudflare bindings available at runtime
        return globalThis.DB
    }
}

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated and is admin
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ users: [], message: 'D1 not available' })
        }

        // Check if current user is admin
        const currentUser = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first() as { role: string } | null

        if (currentUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // Fetch all users
        const { results } = await db.prepare(`
            SELECT id, email, name, phone, plan, role, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `).all()

        return NextResponse.json({ users: results || [] })
    } catch (error) {
        console.error('[Admin Users Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// PATCH /api/admin/users - Update user role
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'D1 not available' }, { status: 503 })
        }

        // Check if current user is admin
        const currentUser = await db.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(user.id).first() as { role: string } | null

        if (currentUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        const { userId, role } = body

        if (!userId || !role || !['admin', 'client'].includes(role)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        await db.prepare(
            'UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind(role, userId).run()

        return NextResponse.json({ success: true, message: `User role updated to ${role}` })
    } catch (error) {
        console.error('[Admin Users Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
