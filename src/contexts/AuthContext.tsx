'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Session timeout duration (15 minutes in milliseconds)
const SESSION_TIMEOUT_MS = 15 * 60 * 1000

export type UserRole = 'admin' | 'client'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    roleLoading: boolean
    userRole: UserRole
    isAdmin: boolean
    persistentAvatarUrl: string | null
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error?: string }>
    signInWithGoogle: () => Promise<void>
    signInWithPhone: (phone: string) => Promise<{ error?: string }>
    verifyPhoneOtp: (phone: string, token: string) => Promise<{ error?: string }>
    refreshAvatar: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [roleLoading, setRoleLoading] = useState(true)
    const [userRole, setUserRole] = useState<UserRole>('client')
    const [persistentAvatarUrl, setPersistentAvatarUrl] = useState<string | null>(null)
    const [hasRedirected, setHasRedirected] = useState(false) // Prevent multiple redirects
    const router = useRouter()
    const supabase = createClient()

    // Refs for inactivity timeout tracking
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastActivityRef = useRef<number>(Date.now())

    // Fetch user role and avatar from API
    const fetchUserRole = useCallback(async () => {
        try {
            setRoleLoading(true)
            const response = await fetch('/api/users/me')
            if (response.ok) {
                const data = await response.json()
                setUserRole(data.role || 'client')
                setPersistentAvatarUrl(data.avatar_url || null)
            }
        } catch (error) {
            console.error('Failed to fetch user role:', error)
            setUserRole('client')
        } finally {
            setRoleLoading(false)
        }
    }, [])

    // Refresh avatar from D1 (call after upload)
    const refreshAvatar = useCallback(async () => {
        try {
            const response = await fetch('/api/users/me')
            if (response.ok) {
                const data = await response.json()
                setPersistentAvatarUrl(data.avatar_url || null)
            }
        } catch (error) {
            console.error('Failed to refresh avatar:', error)
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
                await fetchUserRole() // Must await to prevent flash
            } else {
                // No user, stop role loading
                setRoleLoading(false)
            }
        }).catch((err) => {
            console.error('Auth initialization error:', err)
            setRoleLoading(false)
        }).finally(() => {
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)

                if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                    // Just update state (already done above), do not redirect
                    return
                }

                if (event === 'SIGNED_IN' && session?.user && !hasRedirected) {
                    // Only redirect on actual fresh sign-in, not token refresh
                    setHasRedirected(true)
                    // Sync user to D1 on sign-in
                    await syncUserToD1(session.user)
                    await fetchUserRole()
                    // Check if already on a dashboard/admin page - avoid unnecessary redirects
                    // Only redirect if we are on the root page or an auth page
                    const currentPath = window.location.pathname
                    const isAuthPage = currentPath.startsWith('/auth') || currentPath === '/'

                    if (isAuthPage) {
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
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUserRole('client')
                    setRoleLoading(false)
                    setHasRedirected(false) // Reset on sign out
                    // Do not auto-redirect here. Let the logout button handle it.
                    // This prevents redirects if SIGNED_OUT fires during profile updates.
                }
                // Note: INITIAL_SESSION and TOKEN_REFRESHED are handled by getSession above
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
        // Clear inactivity timeout on manual sign out
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        await supabase.auth.signOut()
    }, [supabase.auth])

    // Inactivity timeout - auto sign out after 15 minutes of no activity
    useEffect(() => {
        // Only track activity if user is logged in
        if (!user) return

        const resetTimeout = () => {
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Set new timeout
            timeoutRef.current = setTimeout(async () => {
                console.log('Session expired due to inactivity')
                await supabase.auth.signOut()
                router.push('/auth/login?reason=session_expired')
            }, SESSION_TIMEOUT_MS)
        }

        // Throttled activity handler to avoid too many resets
        const handleActivity = () => {
            const now = Date.now()
            // Only reset if at least 1 second has passed since last activity
            if (now - lastActivityRef.current > 1000) {
                lastActivityRef.current = now
                resetTimeout()
            }
        }

        // Activity events to monitor
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true })
        })

        // Initialize the timeout
        resetTimeout()

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity)
            })
        }
    }, [user, supabase.auth, router])

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
            persistentAvatarUrl,
            signIn,
            signUp,
            signOut,
            resetPassword,
            signInWithGoogle,
            signInWithPhone,
            verifyPhoneOtp,
            refreshAvatar
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
