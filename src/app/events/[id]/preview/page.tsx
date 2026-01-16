"use client";

import Link from "next/link";
import { useState, use } from "react";
import StepIndicator from "@/components/StepIndicator";

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={9} eventId={id} />

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href={`/events/${id}/guests`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    ← Back to Guests
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Preview Invitation</h1>
                        <p className="text-foreground-muted">See how your invitation looks on different devices</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/events/${id}/builder`} className="btn-secondary">
                            ✏️ Edit
                        </Link>
                        <Link href={`/events/${id}/payment`} className="btn-primary">
                            Continue to Payment →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Device Toggle */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-center">
                <div className="glass-card p-1 inline-flex">
                    <button
                        onClick={() => setViewMode("mobile")}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${viewMode === "mobile"
                            ? "bg-primary text-white"
                            : "text-foreground-muted hover:text-white"
                            }`}
                    >
                        📱 Mobile
                    </button>
                    <button
                        onClick={() => setViewMode("desktop")}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${viewMode === "desktop"
                            ? "bg-primary text-white"
                            : "text-foreground-muted hover:text-white"
                            }`}
                    >
                        💻 Desktop
                    </button>
                </div>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center">
                <div
                    className={`bg-[#1a1a24] rounded-3xl shadow-2xl border-4 border-[var(--glass-border)] overflow-hidden transition-all duration-500 ${viewMode === "mobile"
                        ? "w-[375px] h-[667px]"
                        : "w-[1024px] h-[640px]"
                        }`}
                >
                    {/* Device Frame */}
                    <div className={`h-full overflow-y-auto ${viewMode === "mobile" ? "p-6" : "p-12"}`}>
                        {/* Invitation Content */}
                        <div className={`h-full flex flex-col items-center justify-center text-center ${viewMode === "desktop" ? "max-w-xl mx-auto" : ""
                            }`}>
                            {/* Header Decoration */}
                            <div className="text-6xl mb-4">💒</div>

                            {/* Couple Names */}
                            <p className="text-sm text-foreground-muted uppercase tracking-widest mb-2">
                                You are cordially invited to
                            </p>
                            <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "serif" }}>
                                Ahmad & Alia
                            </h1>
                            <p className="text-foreground-muted mb-6">Wedding Reception</p>

                            {/* Divider */}
                            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-6" />

                            {/* Date & Time */}
                            <div className="glass-card p-6 w-full mb-6">
                                <p className="text-sm text-foreground-muted uppercase tracking-wide mb-1">Save the Date</p>
                                <p className="text-2xl font-bold text-primary mb-1">15 February 2026</p>
                                <p className="text-foreground-muted">Saturday, 12:00 PM - 4:00 PM</p>
                            </div>

                            {/* Venue */}
                            <div className="glass-card p-6 w-full mb-6">
                                <p className="text-sm text-foreground-muted uppercase tracking-wide mb-1">Venue</p>
                                <p className="text-lg font-semibold text-white mb-1">Dewan Seri Endon, PWTC</p>
                                <p className="text-sm text-foreground-muted">Jalan Tun Ismail, 50480 Kuala Lumpur</p>
                                <button className="mt-3 text-primary text-sm hover:text-primary-hover">
                                    📍 View on Map
                                </button>
                            </div>

                            {/* RSVP Button */}
                            <button className="btn-primary w-full animate-pulse-glow">
                                RSVP Now
                            </button>

                            {/* Footer */}
                            <p className="text-xs text-foreground-muted mt-6">
                                Hosted by Encik Ahmad & Puan Fatimah
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Screen Toggle */}
            <div className="fixed bottom-4 right-4">
                <button className="btn-secondary">
                    ⛶ Full Screen
                </button>
            </div>
        </div>
    );
}
