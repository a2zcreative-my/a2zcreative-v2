"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle2, XCircle, Users, AlertCircle } from "lucide-react";

interface InviteData {
    id: string;
    inviteeEmail: string;
    role: string;
    ownerName: string;
    ownerEmail: string;
    expiresAt: string;
    createdAt: string;
}

export default function AcceptInvitePage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const token = params.token as string;

    const [invite, setInvite] = useState<InviteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);
    const [status, setStatus] = useState<"pending" | "accepted" | "declined" | "error">("pending");

    // Fetch invite details
    useEffect(() => {
        async function fetchInvite() {
            try {
                const response = await fetch(`/api/team/invite/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "Failed to load invitation");
                    return;
                }

                setInvite(data.invite);
            } catch (err) {
                setError("Failed to load invitation details");
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            fetchInvite();
        }
    }, [token]);

    const handleAccept = async () => {
        if (!user) {
            // Redirect to login with return URL
            router.push(`/auth/login?redirect=/team/invite/${token}`);
            return;
        }

        setAccepting(true);
        try {
            const response = await fetch("/api/team/invite/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to accept invitation");
                setStatus("error");
                return;
            }

            setStatus("accepted");
        } catch (err) {
            setError("Failed to accept invitation");
            setStatus("error");
        } finally {
            setAccepting(false);
        }
    };

    const handleDecline = async () => {
        setDeclining(true);
        try {
            const response = await fetch("/api/team/invite/decline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to decline invitation");
                setStatus("error");
                return;
            }

            setStatus("declined");
        } catch (err) {
            setError("Failed to decline invitation");
            setStatus("error");
        } finally {
            setDeclining(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md w-full text-center">
                {/* Logo */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        A2ZCreative
                    </h1>
                </div>

                {/* Error State */}
                {error && status !== "accepted" && status !== "declined" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-error" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Invitation Error</h2>
                        <p className="text-foreground-muted mb-6">{error}</p>
                        <Link href="/" className="btn-primary">
                            Go to Homepage
                        </Link>
                    </div>
                )}

                {/* Accepted State */}
                {status === "accepted" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">You're on the team!</h2>
                        <p className="text-foreground-muted mb-6">
                            You've successfully joined {invite?.ownerName || "the team"}'s team.
                        </p>
                        <Link href="/dashboard" className="btn-primary">
                            Go to Dashboard
                        </Link>
                    </div>
                )}

                {/* Declined State */}
                {status === "declined" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-foreground-muted/20 flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-foreground-muted" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Invitation Declined</h2>
                        <p className="text-foreground-muted mb-6">
                            You've declined the team invitation.
                        </p>
                        <Link href="/" className="btn-secondary">
                            Go to Homepage
                        </Link>
                    </div>
                )}

                {/* Pending State - Show invite details */}
                {!error && status === "pending" && invite && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Team Invitation</h2>
                        <p className="text-foreground-muted mb-6">
                            <strong className="text-white">{invite.ownerName || invite.ownerEmail}</strong> has invited you to join their team as an <strong className="text-white">{invite.role}</strong>.
                        </p>

                        <div className="bg-background-tertiary rounded-xl p-4 mb-6 text-left">
                            <div className="text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-foreground-muted">Invited email:</span>
                                    <span className="text-white">{invite.inviteeEmail}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-foreground-muted">Role:</span>
                                    <span className="text-white capitalize">{invite.role}</span>
                                </div>
                            </div>
                        </div>

                        {!user && (
                            <p className="text-sm text-warning mb-4">
                                You need to sign in to accept this invitation.
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleDecline}
                                disabled={declining || accepting}
                                className="flex-1 btn-secondary flex items-center justify-center gap-2"
                            >
                                {declining && <Loader2 className="w-4 h-4 animate-spin" />}
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={accepting || declining}
                                className="flex-1 btn-primary flex items-center justify-center gap-2"
                            >
                                {accepting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {user ? "Accept" : "Sign in & Accept"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
