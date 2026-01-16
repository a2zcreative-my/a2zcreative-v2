"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { signUp, signInWithGoogle, user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan");

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            router.push("/events");
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        const result = await signUp(
            formData.email,
            formData.password,
            formData.name,
            formData.phone
        );

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            setSuccess(true);
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        await signInWithGoogle();
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                        <span className="text-4xl">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                    <p className="text-foreground-muted">
                        We&apos;ve sent a confirmation link to <span className="text-white">{formData.email}</span>.
                        Please click the link to verify your account.
                    </p>
                    <Link href="/login" className="btn-primary inline-block px-8">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1a0a30] via-[#2d1b4e] to-[#1a0a30]">
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.4),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.3),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.3),transparent_50%)]" />

                {/* Content - Centered */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                                <Image src="/logo.png" alt="A2ZCreative" width={64} height={64} />
                            </div>
                            <h1 className="text-5xl font-bold text-white">
                                A2ZCreative
                            </h1>
                        </div>
                        <p className="text-xl text-foreground-muted max-w-md mx-auto">
                            Join thousands of happy couples creating beautiful digital invitations for their special moments.
                        </p>
                    </div>

                    <div className="space-y-4 w-full max-w-sm">
                        <div className="flex items-center gap-4 glass-card p-4">
                            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center text-2xl shrink-0">✓</div>
                            <div className="text-left">
                                <p className="font-medium text-white">Easy to Create</p>
                                <p className="text-sm text-foreground-muted">No design skills needed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 glass-card p-4">
                            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center text-2xl shrink-0">✓</div>
                            <div className="text-left">
                                <p className="font-medium text-white">Instant Sharing</p>
                                <p className="text-sm text-foreground-muted">Share via WhatsApp, SMS & more</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 glass-card p-4">
                            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center text-2xl shrink-0">✓</div>
                            <div className="text-left">
                                <p className="font-medium text-white">RSVP Tracking</p>
                                <p className="text-sm text-foreground-muted">Know who&apos;s coming instantly</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8">
                {/* Top Right - Sign In Button */}
                <div className="flex justify-end items-center gap-4 mb-4">
                    <span className="text-foreground-muted">Already have an account?</span>
                    <Link
                        href="/login"
                        className="px-6 py-2.5 rounded-xl border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                    >
                        Sign In
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md space-y-8 animate-fade-in">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                    <Image src="/logo.png" alt="A2ZCreative" width={48} height={48} />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    A2ZCreative
                                </h1>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-foreground-muted">
                                Start creating beautiful digital invitations today
                            </p>
                            {plan && (
                                <p className="text-primary mt-2 text-sm">
                                    Selected plan: <span className="font-semibold capitalize">{plan}</span>
                                </p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Register Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+60 12-345 6789"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="input-field pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-white"
                                    >
                                        {showPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-[var(--glass-border)] bg-background-secondary"
                                    required
                                />
                                <label htmlFor="terms" className="text-sm text-foreground-muted">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-primary hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !agreeTerms}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <span>Create Account</span>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[var(--glass-border)]"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-background text-foreground-muted">or continue with</span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <button
                                type="button"
                                onClick={handleGoogleSignUp}
                                className="btn-secondary w-full flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign up with Google
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
