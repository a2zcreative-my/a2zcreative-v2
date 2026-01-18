import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

// This endpoint syncs ALL users from Supabase to D1
// It uses the Supabase service role key to access all users
export async function POST(request: NextRequest) {
    try {
        // Get the service role key from environment
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Missing Supabase credentials. Set SUPABASE_SERVICE_ROLE_KEY.' },
                { status: 500 }
            )
        }

        // Create admin client with service role key
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Get D1 database
        const db = getDB()
        if (!db) {
            return NextResponse.json(
                { error: 'D1 database not available' },
                { status: 503 }
            )
        }

        // Fetch all users from Supabase Auth
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch users from Supabase', details: error.message },
                { status: 500 }
            )
        }

        // Check request body for admin emails to set
        let adminEmails: string[] = []
        try {
            const body = await request.json()
            adminEmails = body.adminEmails || []
        } catch {
            // No body provided, that's fine
        }

        // Sync each user to D1
        let synced = 0
        let errors: string[] = []

        for (const user of users) {
            try {
                // Determine role - check if email is in admin list
                const isAdmin = adminEmails.includes(user.email || '')
                const role = isAdmin ? 'admin' : 'client'

                await db.prepare(`
                    INSERT INTO users (id, email, name, phone, plan, role, created_at, updated_at)
                    VALUES (?, ?, ?, ?, 'starter', ?, datetime('now'), datetime('now'))
                    ON CONFLICT(id) DO UPDATE SET
                        email = excluded.email,
                        name = COALESCE(excluded.name, users.name),
                        phone = COALESCE(excluded.phone, users.phone),
                        role = CASE 
                            WHEN excluded.role = 'admin' THEN 'admin' 
                            ELSE COALESCE(users.role, 'client') 
                        END,
                        updated_at = datetime('now')
                `).bind(
                    user.id,
                    user.email,
                    user.user_metadata?.name || user.user_metadata?.full_name || null,
                    user.user_metadata?.phone || user.phone || null,
                    role
                ).run()

                synced++
            } catch (e) {
                errors.push(`Failed to sync ${user.email}: ${String(e)}`)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${synced} users from Supabase to D1`,
            totalUsers: users.length,
            synced,
            errors: errors.length > 0 ? errors : undefined
        })
    } catch (error) {
        console.error('[Bulk Sync Error]:', error)
        return NextResponse.json(
            { error: 'Bulk sync failed', details: String(error) },
            { status: 500 }
        )
    }
}

// GET to check sync status
export async function GET() {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'D1 not available' }, { status: 503 })
        }

        const result = await db.prepare('SELECT COUNT(*) as count FROM users').first() as { count: number }
        const admins = await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").first() as { count: number }

        return NextResponse.json({
            totalUsers: result?.count || 0,
            adminCount: admins?.count || 0
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
