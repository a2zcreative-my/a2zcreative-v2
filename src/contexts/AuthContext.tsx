'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export type UserRole = 'admin' | 'client'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    roleLoading: boolean
    userRole: UserRole
    isAdmin: boolean
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error?: string }>
    signInWithGoogle: () => Promise<void>
    signInWithPhone: (phone: string) => Promise<{ error?: string }>
    verifyPhoneOtp: (phone: string, token: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [roleLoading, setRoleLoading] = useState(true)
    const [userRole, setUserRole] = useState<UserRole>('client')
    const router = useRouter()
    const supabase = createClient()

    // Fetch user role from API
    const fetchUserRole = useCallback(async () => {
        try {
            setRoleLoading(true)
            const response = await fetch('/api/users/me')
            if (response.ok) {
                const data = await response.json()
                setUserRole(data.role || 'client')
            }
        } catch (error) {
            console.error('Failed to fetch user role:', error)
            setUserRole('client')
        } finally {
            setRoleLoading(false)
        }
    }, [])

    // Sync user to D1 database
    const syncUserToD1 = useCallback(async (user: User) => {
        try {
            await fetch('/api/users/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.user_metadata?.full_name,
                    phone: user.user_metadata?.phone
                })
            })
        } catch (error) {
            console.error('User sync failed:', error)
            // Don't fail - sync is non-critical
        }
    }, [])

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                // Sync user to D1 on initial load
                await syncUserToD1(session.user)
                fetchUserRole()
            }
        }).catch((err) => {
            console.error('Auth initialization error:', err)
        }).finally(() => {
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)

                if (event === 'SIGNED_IN' && session?.user) {
                    // Sync user to D1 on sign-in
                    await syncUserToD1(session.user)
                    await fetchUserRole()
                    // Redirect based on role - need to fetch fresh role
                    const roleResponse = await fetch('/api/users/me')
                    if (roleResponse.ok) {
                        const roleData = await roleResponse.json()
                        if (roleData.role === 'admin') {
                            router.push('/admin')
                        } else {
                            router.push('/dashboard')
                        }
                    } else {
                        router.push('/dashboard')
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUserRole('client')
                    router.push('/auth/login')
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [router, supabase.auth, fetchUserRole, syncUserToD1])


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

    const signInWithPhone = useCallback(async (phone: string) => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone,
                options: {
                    channel: 'sms'
                }
            })
            if (error) return { error: error.message }
            return {}
        } catch (err) {
            return { error: 'An unexpected error occurred' }
        }
    }, [supabase.auth])

    const verifyPhoneOtp = useCallback(async (phone: string, token: string) => {
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms'
            })
            if (error) return { error: error.message }
            return {}
        } catch (err) {
            return { error: 'An unexpected error occurred' }
        }
    }, [supabase.auth])

    const isAdmin = userRole === 'admin'

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            roleLoading,
            userRole,
            isAdmin,
            signIn,
            signUp,
            signOut,
            resetPassword,
            signInWithGoogle,
            signInWithPhone,
            verifyPhoneOtp
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
