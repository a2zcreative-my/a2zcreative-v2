import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
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

// Check if user is admin
async function isAdmin(db: unknown, userId: string): Promise<boolean> {
    const user = await (db as { prepare: (sql: string) => { bind: (...args: unknown[]) => { first: () => Promise<{ role: string } | null> } } }).prepare('SELECT role FROM users WHERE id = ?').bind(userId).first()
    return user?.role === 'admin'
}

// GET /api/admin/plans - List all plans (including inactive)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ plans: [], message: 'D1 not available' })
        }

        if (!await isAdmin(db, user.id)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const { results } = await db.prepare(`
            SELECT * FROM plans ORDER BY sort_order ASC
        `).all()

        // Parse JSON fields
        const plans = (results || []).map((plan: Record<string, unknown>) => ({
            ...plan,
            events: JSON.parse((plan.events as string) || '[]'),
            features: JSON.parse((plan.features as string) || '[]'),
            notIncluded: JSON.parse((plan.not_included as string) || '[]'),
            popular: plan.popular === 1,
            active: plan.active === 1,
        }))

        return NextResponse.json({ plans })
    } catch (error) {
        console.error('[Admin Plans Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// POST /api/admin/plans - Create a new plan
export async function POST(request: NextRequest) {
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

        if (!await isAdmin(db, user.id)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        const { id, name, price, priceNote, tagline, color, gradient, icon, events, features, notIncluded, popular, sortOrder } = body

        if (!id || !name || price === undefined) {
            return NextResponse.json({ error: 'Missing required fields: id, name, price' }, { status: 400 })
        }

        await db.prepare(`
            INSERT INTO plans (id, name, price, price_note, tagline, color, gradient, icon, events, features, not_included, popular, sort_order, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).bind(
            id,
            name,
            price,
            priceNote || 'one-time',
            tagline || '',
            color || id,
            gradient || `from-${id} to-gray-600`,
            icon || 'Cake',
            JSON.stringify(events || []),
            JSON.stringify(features || []),
            JSON.stringify(notIncluded || []),
            popular ? 1 : 0,
            sortOrder || 0
        ).run()

        return NextResponse.json({ success: true, message: 'Plan created' })
    } catch (error) {
        console.error('[Admin Plans Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// PATCH /api/admin/plans - Update a plan
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

        if (!await isAdmin(db, user.id)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
        }

        // Build dynamic update query
        const fields: string[] = []
        const values: unknown[] = []

        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
        if (updates.price !== undefined) { fields.push('price = ?'); values.push(updates.price) }
        if (updates.priceNote !== undefined) { fields.push('price_note = ?'); values.push(updates.priceNote) }
        if (updates.tagline !== undefined) { fields.push('tagline = ?'); values.push(updates.tagline) }
        if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color) }
        if (updates.gradient !== undefined) { fields.push('gradient = ?'); values.push(updates.gradient) }
        if (updates.icon !== undefined) { fields.push('icon = ?'); values.push(updates.icon) }
        if (updates.events !== undefined) { fields.push('events = ?'); values.push(JSON.stringify(updates.events)) }
        if (updates.features !== undefined) { fields.push('features = ?'); values.push(JSON.stringify(updates.features)) }
        if (updates.notIncluded !== undefined) { fields.push('not_included = ?'); values.push(JSON.stringify(updates.notIncluded)) }
        if (updates.popular !== undefined) { fields.push('popular = ?'); values.push(updates.popular ? 1 : 0) }
        if (updates.sortOrder !== undefined) { fields.push('sort_order = ?'); values.push(updates.sortOrder) }
        if (updates.active !== undefined) { fields.push('active = ?'); values.push(updates.active ? 1 : 0) }

        fields.push('updated_at = datetime("now")')
        values.push(id)

        await db.prepare(`UPDATE plans SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run()

        return NextResponse.json({ success: true, message: 'Plan updated' })
    } catch (error) {
        console.error('[Admin Plans Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

// DELETE /api/admin/plans - Delete a plan (or deactivate)
export async function DELETE(request: NextRequest) {
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

        if (!await isAdmin(db, user.id)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const hardDelete = searchParams.get('hard') === 'true'

        if (!id) {
            return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
        }

        if (hardDelete) {
            await db.prepare('DELETE FROM plans WHERE id = ?').bind(id).run()
            return NextResponse.json({ success: true, message: 'Plan deleted permanently' })
        } else {
            await db.prepare('UPDATE plans SET active = 0, updated_at = datetime("now") WHERE id = ?').bind(id).run()
            return NextResponse.json({ success: true, message: 'Plan deactivated' })
        }
    } catch (error) {
        console.error('[Admin Plans Error]:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
