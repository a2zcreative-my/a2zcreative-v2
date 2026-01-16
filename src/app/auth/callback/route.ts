import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createServerSupabaseClient()

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Sync user to D1
            try {
                const baseUrl = requestUrl.origin
                await fetch(`${baseUrl}/api/users/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                        phone: data.user.user_metadata?.phone
                    })
                })
            } catch (syncError) {
                console.error('User sync failed:', syncError)
            }
        }
    }

    // Redirect to events page after auth
    return NextResponse.redirect(new URL('/events', request.url))
}

export const runtime = 'edge';
