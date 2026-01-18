import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Access D1 binding from Cloudflare environment
        // @ts-expect-error - Cloudflare bindings available at runtime
        const db = request.cf?.env?.DB || globalThis.DB

        if (!db) {
            // D1 not available - return default role
            return NextResponse.json({
                id: user.id,
                email: user.email,
                role: 'client' // Default to client if D1 not available
            })
        }

        // Fetch user with role from D1
        const dbUser = await db.prepare(
            'SELECT id, email, name, role FROM users WHERE id = ?'
        ).bind(user.id).first()

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: dbUser?.name || user.user_metadata?.name,
            role: dbUser?.role || 'client' // Default to client
        })
    } catch (error) {
        console.error('[Get User Error]:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}
