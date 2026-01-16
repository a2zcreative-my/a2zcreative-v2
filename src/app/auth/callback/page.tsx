'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            const supabase = createClient()

            // Get the code from URL
            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get('code')
            const errorParam = urlParams.get('error')
            const errorDescription = urlParams.get('error_description')

            if (errorParam) {
                setError(errorDescription || errorParam)
                return
            }

            if (code) {
                try {
                    const { error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) {
                        setError(error.message)
                        return
                    }
                } catch (err) {
                    setError('Failed to complete authentication')
                    return
                }
            }

            // Check if we have a session
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                // Sync user to database
                try {
                    await fetch('/api/users/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: session.user.id,
                            email: session.user.email,
                            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
                            phone: session.user.user_metadata?.phone
                        })
                    })
                } catch {
                    // Ignore sync errors
                }

                router.push('/events')
            } else {
                router.push('/auth/login')
            }
        }

        handleCallback()
    }, [router])

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Authentication Failed</h2>
                    <p className="text-foreground-muted">{error}</p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="btn-primary px-8"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-foreground-muted">Completing sign in...</p>
            </div>
        </div>
    )
}
