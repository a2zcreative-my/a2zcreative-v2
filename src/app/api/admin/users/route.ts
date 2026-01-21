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

// GET /api/admin/users - List all users with optional filters
export async function GET(request: NextRequest) {
    try {
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

        // Get query params for filtering
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const plan = searchParams.get('plan')
        const role = searchParams.get('role')
        const status = searchParams.get('status')

        // Build query with filters
        let query = `
            SELECT id, email, name, phone, avatar_url, plan, role, 
                   COALESCE(status, 'active') as status, last_login, created_at, updated_at
            FROM users
            WHERE 1=1
        `
        const params: string[] = []

        if (search) {
            query += ` AND (email LIKE ? OR name LIKE ?)`
            params.push(`%${search}%`, `%${search}%`)
        }
        if (plan) {
            query += ` AND plan = ?`
            params.push(plan)
        }
        if (role) {
            query += ` AND role = ?`
            params.push(role)
        }
        if (status) {
            query += ` AND COALESCE(status, 'active') = ?`
            params.push(status)
        }

        query += ` ORDER BY created_at DESC`

        const stmt = db.prepare(query)
        const { results } = await (params.length > 0
            ? stmt.bind(...params).all()
            : stmt.all())

        return NextResponse.json({ users: results || [] })
    } catch (error) {
        console.error('[Admin Users Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// PUT /api/admin/users - Update user plan, role, or status
export async function PUT(request: NextRequest) {
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
        const { userId, plan, role, status } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Build dynamic update query
        const updates: string[] = []
        const values: string[] = []

        if (plan && ['starter', 'basic', 'premium', 'exclusive'].includes(plan)) {
            updates.push('plan = ?')
            values.push(plan)
        }
        if (role && ['admin', 'client'].includes(role)) {
            updates.push('role = ?')
            values.push(role)
        }
        if (status && ['active', 'suspended'].includes(status)) {
            updates.push('status = ?')
            values.push(status)
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }

        updates.push('updated_at = datetime("now")')
        values.push(userId)

        await db.prepare(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...values).run()

        return NextResponse.json({
            success: true,
            message: 'User updated successfully'
        })
    } catch (error) {
        console.error('[Admin Users Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// PATCH /api/admin/users - Update user role (legacy, kept for compatibility)
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
