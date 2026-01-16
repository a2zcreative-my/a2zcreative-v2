'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error?: string }>
    signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)

                if (event === 'SIGNED_IN') {
                    router.push('/events')
                } else if (event === 'SIGNED_OUT') {
                    router.push('/login')
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [router, supabase.auth])

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) return { error: error.message }
            return {}
        } catch (err) {
            return { error: 'An unexpected error occurred' }
        }
    }, [supabase.auth])

    const signUp = useCallback(async (email: string, password: string, name: string, phone: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name, phone }
                }
            })
            if (error) return { error: error.message }

            // Sync to D1 after successful signup
            if (data.user) {
                try {
                    await fetch('/api/users/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: data.user.id,
                            email: data.user.email,
                            name,
                            phone
                        })
                    })
                } catch (syncError) {
                    console.error('User sync failed:', syncError)
                    // Don't fail registration if sync fails
                }
            }

            return {}
        } catch (err) {
            return { error: 'An unexpected error occurred' }
        }
    }, [supabase.auth])

    const signOut = useCallback(async () => {
        await supabase.auth.signOut()
    }, [supabase.auth])

    const resetPassword = useCallback(async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })
            if (error) return { error: error.message }
            return {}
        } catch (err) {
            return { error: 'An unexpected error occurred' }
        }
    }, [supabase.auth])

    const signInWithGoogle = useCallback(async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
    }, [supabase.auth])

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signIn,
            signUp,
            signOut,
            resetPassword,
            signInWithGoogle
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
