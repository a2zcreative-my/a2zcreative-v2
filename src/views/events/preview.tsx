"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import {
    Smartphone,
    Laptop,
    Pencil,
    Church,
    MapPin,
    Maximize,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";

export default function PreviewPage() {
    const params = useParams();
    const id = params?.id as string;
    const [viewMode, setViewMode] = useState<"iphone" | "macbook">("iphone");

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={9} eventId={id} />

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href={`/events/${id}/guests`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Guests
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Preview Invitation</h1>
                        <p className="text-foreground-muted">See how your invitation looks on different devices</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/events/${id}/builder`} className="btn-secondary flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit
                        </Link>
                        <Link href={`/events/${id}/payment`} className="btn-primary flex items-center gap-2">
                            Continue to Payment
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Device Toggle */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-center">
                <div className="glass-card p-1 inline-flex">
                    <button
                        onClick={() => setViewMode("iphone")}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${viewMode === "iphone"
                            ? "bg-primary text-white"
                            : "text-foreground-muted hover:text-white"
                            }`}
                    >
                        <Smartphone className="w-4 h-4" />
                        iPhone 16
                    </button>
                    <button
                        onClick={() => setViewMode("macbook")}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${viewMode === "macbook"
                            ? "bg-primary text-white"
                            : "text-foreground-muted hover:text-white"
                            }`}
                    >
                        <Laptop className="w-4 h-4" />
                        MacBook
                    </button>
                </div>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center">
                <div
                    className={`bg-[#1a1a24] rounded-[40px] shadow-2xl border-4 border-[var(--glass-border)] overflow-hidden transition-all duration-500 ${viewMode === "iphone"
                        ? "w-[393px] h-[852px]"
                        : "w-[1280px] h-[800px]"
                        }`}
                >
                    {/* Device Frame - iPhone 16 Dynamic Island or MacBook menu bar */}
                    {viewMode === "iphone" && (
                        <div className="h-12 bg-[#1a1a24] flex items-start justify-center pt-3">
                            <div className="w-[126px] h-[37px] bg-black rounded-full" />
                        </div>
                    )}
                    {viewMode === "macbook" && (
                        <div className="h-7 bg-[#2a2a34] flex items-center justify-between px-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="text-xs text-foreground-muted">eventkad.my/i/ahmad-alia-2026</div>
                            <div className="w-16" />
                        </div>
                    )}
                    <div className={`overflow-y-auto ${viewMode === "iphone" ? "h-[calc(100%-2rem)] p-6" : "h-[calc(100%-1.75rem)] p-12"}`}>
                        {/* Invitation Content */}
                        <div className={`h-full flex flex-col items-center justify-center text-center ${viewMode === "macbook" ? "max-w-xl mx-auto" : ""
                            }`}>
                            {/* Header Decoration */}
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                                <Church className="w-8 h-8 text-primary" />
                            </div>

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
                                <button className="mt-3 text-primary text-sm hover:text-primary-hover flex items-center gap-1 mx-auto">
                                    <MapPin className="w-4 h-4" />
                                    View on Map
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
                <button className="btn-secondary flex items-center gap-2">
                    <Maximize className="w-4 h-4" />
                    Full Screen
                </button>
            </div>
        </div>
    );
}
