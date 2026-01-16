import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectUrl = new URL('/events', request.url)

    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables')
        return new NextResponse(
            JSON.stringify({
                error: 'Configuration error',
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseAnonKey
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }

    if (!code) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
        // Parse cookies from request
        const cookieHeader = request.headers.get('cookie') || ''
        const parsedCookies = cookieHeader.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=')
            return { name: name || '', value: rest.join('=') }
        }).filter(c => c.name)

        // Create Supabase client
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return parsedCookies
                    },
                    setAll() {
                        // Handled via response cookies
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Supabase auth error:', error.message)
            return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
        }

        if (data.session) {
            const response = NextResponse.redirect(redirectUrl)

            // Set auth cookies
            const cookieOptions = {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'lax' as const,
                maxAge: 60 * 60 * 24 * 365,
            }

            response.cookies.set('sb-access-token', data.session.access_token, cookieOptions)
            response.cookies.set('sb-refresh-token', data.session.refresh_token, cookieOptions)

            // Sync user (non-blocking)
            if (data.user) {
                fetch(`${requestUrl.origin}/api/users/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                        phone: data.user.user_metadata?.phone
                    })
                }).catch(() => { })
            }

            return response
        }

        return NextResponse.redirect(redirectUrl)
    } catch (err) {
        console.error('Auth callback exception:', err)
        return new NextResponse(
            JSON.stringify({ error: 'Auth callback failed', message: String(err) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
