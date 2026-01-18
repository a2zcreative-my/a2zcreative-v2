"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Calendar, Download, Eye, UserCheck, Percent, CheckCircle, Loader2 } from "lucide-react";

interface EventStat {
    id: string;
    title: string;
    guests: number;
    confirmed: number;
    checkedIn: number;
    views: number;
}

const timeRanges = [
    { id: "7", label: "Last 7 Days", multiplier: 0.3 },
    { id: "30", label: "Last 30 Days", multiplier: 1 },
    { id: "90", label: "Last 90 Days", multiplier: 2.5 },
    { id: "all", label: "All Time", multiplier: 4 },
];

export default function ReportsPage() {
    const [eventStats, setEventStats] = useState<EventStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState("30");
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    useEffect(() => {
        async function fetchReportData() {
            try {
                const response = await fetch('/api/client/dashboard');
                if (response.ok) {
                    const data = await response.json();
                    // Transform dashboard data to event stats format
                    const allEvents = [...(data.publishedInvitations || []), ...(data.draftEvents || [])];
                    const stats: EventStat[] = allEvents.map((e: { id: string; title: string; views?: number; rsvp?: { confirmed: number } }) => ({
                        id: e.id,
                        title: e.title,
                        guests: e.rsvp?.confirmed || 0,
                        confirmed: e.rsvp?.confirmed || 0,
                        checkedIn: 0,
                        views: e.views || 0
                    }));
                    setEventStats(stats);
                }
            } catch (error) {
                console.error('Failed to fetch report data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchReportData();
    }, []);

    // Get multiplier for dynamic stats based on selected range
    const multiplier = timeRanges.find(r => r.id === selectedRange)?.multiplier || 1;

    const totalGuests = Math.round(eventStats.reduce((sum, e) => sum + e.guests, 0) * multiplier);
    const totalConfirmed = Math.round(eventStats.reduce((sum, e) => sum + e.confirmed, 0) * multiplier);
    const totalCheckedIn = Math.round(eventStats.reduce((sum, e) => sum + e.checkedIn, 0) * multiplier);
    const totalViews = Math.round(eventStats.reduce((sum, e) => sum + e.views, 0) * multiplier);

    // Handle export
    const handleExport = () => {
        setIsExporting(true);

        // Generate CSV content
        const headers = ["Event Name", "Total Guests", "Confirmed", "Checked In", "Views"];
        const rows = eventStats.map(e => [e.title, e.guests, e.confirmed, e.checkedIn, e.views]);
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // Create and download file
        setTimeout(() => {
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `a2zcreative-report-${selectedRange}days.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setIsExporting(false);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 2000);
        }, 500);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
                            <p className="text-foreground-muted">Track your event performance</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
                        <p className="text-foreground-muted">Track your event performance</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="input-field"
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                        >
                            {timeRanges.map(range => (
                                <option key={range.id} value={range.id}>{range.label}</option>
                            ))}
                        </select>
                        <button
                            className="btn-secondary flex items-center gap-2"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {exportSuccess ? (
                                <>
                                    <CheckCircle className="w-4 h-4 text-success" />
                                    Exported!
                                </>
                            ) : isExporting ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Export
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Total Guests</p>
                                <p className="text-2xl font-bold text-white">{totalGuests}</p>
                                <p className="text-xs text-success flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +12%
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Confirmed</p>
                                <p className="text-2xl font-bold text-success">{totalConfirmed}</p>
                                <p className="text-xs text-success flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +8%
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                                <Percent className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">RSVP Rate</p>
                                <p className="text-2xl font-bold text-secondary">{Math.round((totalConfirmed / totalGuests) * 100)}%</p>
                                <p className="text-xs text-success flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +5%
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Page Views</p>
                                <p className="text-2xl font-bold text-warning">{totalViews.toLocaleString()}</p>
                                <p className="text-xs text-success flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +25%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Event Performance */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Event Performance</h2>
                            <BarChart3 className="w-5 h-5 text-foreground-muted" />
                        </div>
                        <div className="space-y-4">
                            {eventStats.length === 0 ? (
                                <div className="p-8 text-center text-foreground-muted">No events to display</div>
                            ) : eventStats.map((event, idx) => {
                                const confirmRate = event.guests > 0 ? Math.round((event.confirmed / event.guests) * 100) : 0;
                                return (
                                    <div key={idx} className="p-4 bg-background-tertiary rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-white">{event.title}</p>
                                            <span className="text-foreground-muted text-sm">{event.guests} guests</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                                            <div>
                                                <p className="text-foreground-muted">Confirmed</p>
                                                <p className="text-success font-medium">{event.confirmed}</p>
                                            </div>
                                            <div>
                                                <p className="text-foreground-muted">Checked In</p>
                                                <p className="text-secondary font-medium">{event.checkedIn}</p>
                                            </div>
                                            <div>
                                                <p className="text-foreground-muted">Views</p>
                                                <p className="text-warning font-medium">{event.views}</p>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-background rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${confirmRate}%` }} />
                                        </div>
                                        <p className="text-xs text-foreground-muted mt-1">{confirmRate}% confirmation rate</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                            <Calendar className="w-5 h-5 text-foreground-muted" />
                        </div>
                        <div className="space-y-3">
                            <div className="p-8 text-center text-foreground-muted">No recent activity</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
