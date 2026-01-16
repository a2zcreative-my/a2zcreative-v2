"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const result = await resetPassword(email);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            setSubmitted(true);
            setIsLoading(false);
        }
    };

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

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8">
                {/* Top Right - Sign In Button */}
                <div className="flex justify-end items-center gap-4 mb-4">
                    <span className="text-foreground-muted">Remember your password?</span>
                    <Link
                        href="/auth/login"
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

                        {!submitted ? (
                            <>
                                {/* Header */}
                                <div className="text-center lg:text-left">
                                    <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                                    <p className="text-foreground-muted">
                                        No worries! Enter your email and we&apos;ll send you a reset link.
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Reset Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <span>Send Reset Link</span>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center lg:text-left">
                                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-4xl mx-auto lg:mx-0 mb-6">
                                    ✉️
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Check Your Email</h2>
                                <p className="text-foreground-muted mb-6">
                                    We&apos;ve sent a password reset link to:
                                </p>
                                <p className="text-primary font-semibold text-lg mb-8">{email}</p>

                                <div className="glass-card p-4 text-left text-sm text-foreground-muted mb-6">
                                    <p className="mb-2">💡 <strong className="text-white">Didn&apos;t receive the email?</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Check your spam folder</li>
                                        <li>Make sure you entered the correct email</li>
                                        <li>Wait a few minutes and try again</li>
                                    </ul>
                                </div>

                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setEmail("");
                                        setError("");
                                    }}
                                    className="btn-secondary"
                                >
                                    Try Different Email
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
