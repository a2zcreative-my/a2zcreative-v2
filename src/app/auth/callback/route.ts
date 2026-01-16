import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    // Create response early so we can set cookies on it
    const redirectUrl = new URL('/events', request.url)

    if (code) {
        // Create Supabase client with request cookies
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        const cookieHeader = request.headers.get('cookie') || ''
                        return cookieHeader.split(';').map(cookie => {
                            const [name, ...rest] = cookie.trim().split('=')
                            return { name, value: rest.join('=') }
                        }).filter(c => c.name)
                    },
                    setAll(cookiesToSet) {
                        // Cookies will be set via response headers
                    },
                },
            }
        )

        try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (!error && data.session) {
                // Create the response with redirect
                const response = NextResponse.redirect(redirectUrl)

                // Set the auth cookies on the response
                const cookieOptions = {
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax' as const,
                    maxAge: 60 * 60 * 24 * 365, // 1 year
                }

                response.cookies.set('sb-access-token', data.session.access_token, cookieOptions)
                response.cookies.set('sb-refresh-token', data.session.refresh_token, cookieOptions)

                // Sync user to D1 (fire and forget, don't block)
                if (data.user) {
                    const baseUrl = requestUrl.origin
                    fetch(`${baseUrl}/api/users/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: data.user.id,
                            email: data.user.email,
                            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                            phone: data.user.user_metadata?.phone
                        })
                    }).catch(err => console.error('User sync failed:', err))
                }

                return response
            }
        } catch (err) {
            console.error('Auth callback error:', err)
        }
    }

    // Fallback redirect
    return NextResponse.redirect(redirectUrl)
}
