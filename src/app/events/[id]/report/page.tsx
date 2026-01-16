"use client";

import Link from "next/link";
import { use } from "react";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const stats = {
        totalInvited: 200,
        totalRSVP: 156,
        totalAttended: 142,
        attendanceRate: 91,
        totalViews: 1247,
        avgViewTime: "2m 34s",
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <Link href="/dashboard" className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    ← Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Post-Event Report</h1>
                        <p className="text-foreground-muted">Majlis Perkahwinan Ahmad & Alia • 15 Feb 2026</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary">
                            📄 Export PDF
                        </button>
                        <button className="btn-secondary">
                            📊 Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Stats */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-white">{stats.totalInvited}</p>
                    <p className="text-sm text-foreground-muted">Invited</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{stats.totalRSVP}</p>
                    <p className="text-sm text-foreground-muted">RSVP&apos;d</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-success">{stats.totalAttended}</p>
                    <p className="text-sm text-foreground-muted">Attended</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-warning">{stats.attendanceRate}%</p>
                    <p className="text-sm text-foreground-muted">Rate</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-info">{stats.totalViews}</p>
                    <p className="text-sm text-foreground-muted">Views</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-secondary">{stats.avgViewTime}</p>
                    <p className="text-sm text-foreground-muted">Avg Time</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Chart */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Attendance Overview</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-foreground-muted">Attended</span>
                                <span className="text-success">{stats.totalAttended} (91%)</span>
                            </div>
                            <div className="h-4 bg-background-tertiary rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: "91%" }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-foreground-muted">No Show</span>
                                <span className="text-error">14 (9%)</span>
                            </div>
                            <div className="h-4 bg-background-tertiary rounded-full overflow-hidden">
                                <div className="h-full bg-error rounded-full" style={{ width: "9%" }} />
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart Placeholder */}
                    <div className="mt-6 flex items-center justify-center">
                        <div className="relative w-40 h-40">
                            <div className="absolute inset-0 rounded-full border-[16px] border-success" style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)" }} />
                            <div className="absolute inset-0 rounded-full border-[16px] border-error" style={{ clipPath: "polygon(50% 50%, 100% 0, 85% 0)" }} />
                            <div className="absolute inset-4 rounded-full bg-background-secondary flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">91%</p>
                                    <p className="text-xs text-foreground-muted">Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guest Feedback */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Guest Feedback</h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-background-tertiary">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                <span className="text-sm text-foreground-muted">5.0</span>
                            </div>
                            <p className="text-white text-sm italic">&quot;Beautiful invitation design! Very easy to RSVP.&quot;</p>
                            <p className="text-xs text-foreground-muted mt-1">- Siti binti Hassan</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background-tertiary">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                <span className="text-sm text-foreground-muted">5.0</span>
                            </div>
                            <p className="text-white text-sm italic">&quot;The event details were very clear. Love the design!&quot;</p>
                            <p className="text-xs text-foreground-muted mt-1">- Ahmad bin Ali</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background-tertiary">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-400">⭐⭐⭐⭐</span>
                                <span className="text-sm text-foreground-muted">4.0</span>
                            </div>
                            <p className="text-white text-sm italic">&quot;Great experience, check-in was super fast!&quot;</p>
                            <p className="text-xs text-foreground-muted mt-1">- Tan Wei Ming</p>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-foreground-muted">Average Rating: <span className="text-warning font-bold">4.7/5</span></p>
                    </div>
                </div>

                {/* Photo Gallery */}
                <div className="glass-card p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Event Photo Gallery</h2>
                        <button className="btn-secondary text-sm">
                            📷 Upload Photos
                        </button>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                            <div
                                key={i}
                                className="aspect-square bg-background-tertiary rounded-lg flex items-center justify-center text-foreground-muted hover:bg-[var(--glass-bg)] cursor-pointer transition-colors"
                            >
                                📷
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
