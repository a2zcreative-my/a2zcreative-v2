"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Calendar, Download, Eye, UserCheck, Percent, CheckCircle, Loader2, Smartphone, Monitor, Tablet } from "lucide-react";

interface EventStat {
    id: string;
    title: string;
    guests: number;
    confirmed: number;
    checkedIn: number;
    views: number;
}

interface AnalyticsData {
    viewsOverTime: { date: string; views: number }[];
    deviceBreakdown: { mobile: number; desktop: number; tablet: number };
    totalViews: number;
    eventCount: number;
}

const timeRanges = [
    { id: "7", label: "Last 7 Days" },
    { id: "30", label: "Last 30 Days" },
    { id: "90", label: "Last 90 Days" },
];

// Simple Line Chart Component
function LineChart({ data }: { data: { date: string; views: number }[] }) {
    if (data.length === 0) {
        return <div className="h-48 flex items-center justify-center text-foreground-muted">No data available</div>;
    }

    const maxViews = Math.max(...data.map(d => d.views), 1);
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1 || 1)) * 100,
        y: 100 - (d.views / maxViews) * 100,
        date: d.date,
        views: d.views
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = pathD + ` L ${points[points.length - 1]?.x || 0} 100 L 0 100 Z`;

    return (
        <div className="relative h-48">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--glass-border)" strokeWidth="0.2" />
                ))}
                {/* Area fill */}
                <path d={areaD} fill="url(#gradient)" opacity="0.3" />
                {/* Line */}
                <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                {/* Dots */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="var(--primary)" />
                ))}
                <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
            </svg>
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-foreground-muted">
                <span>{data[0]?.date?.slice(5) || ''}</span>
                <span>{data[Math.floor(data.length / 2)]?.date?.slice(5) || ''}</span>
                <span>{data[data.length - 1]?.date?.slice(5) || ''}</span>
            </div>
        </div>
    );
}

// Device Breakdown Pie
function DevicePie({ data }: { data: { mobile: number; desktop: number; tablet: number } }) {
    const total = data.mobile + data.desktop + data.tablet || 1;
    const mobilePercent = Math.round((data.mobile / total) * 100);
    const desktopPercent = Math.round((data.desktop / total) * 100);
    const tabletPercent = 100 - mobilePercent - desktopPercent;

    const devices = [
        { name: 'Mobile', value: mobilePercent, color: 'var(--primary)', icon: Smartphone },
        { name: 'Desktop', value: desktopPercent, color: 'var(--secondary)', icon: Monitor },
        { name: 'Tablet', value: tabletPercent, color: 'var(--warning)', icon: Tablet },
    ];

    return (
        <div className="space-y-4">
            {devices.map(device => {
                const Icon = device.icon;
                return (
                    <div key={device.name}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" style={{ color: device.color }} />
                                <span className="text-sm text-foreground">{device.name}</span>
                            </div>
                            <span className="text-sm font-medium text-white">{device.value}%</span>
                        </div>
                        <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${device.value}%`, backgroundColor: device.color }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ReportsPage() {
    const [eventStats, setEventStats] = useState<EventStat[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState("30");
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch dashboard data
                const dashResponse = await fetch('/api/client/dashboard');
                if (dashResponse.ok) {
                    const data = await dashResponse.json();
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

                // Fetch analytics data
                const analyticsResponse = await fetch(`/api/client/analytics?days=${selectedRange}`);
                if (analyticsResponse.ok) {
                    const data = await analyticsResponse.json();
                    setAnalytics(data);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedRange]);

    const totalGuests = eventStats.reduce((sum, e) => sum + e.guests, 0);
    const totalConfirmed = eventStats.reduce((sum, e) => sum + e.confirmed, 0);
    const totalViews = analytics?.totalViews || eventStats.reduce((sum, e) => sum + e.views, 0);

    // Handle export
    const handleExport = () => {
        setIsExporting(true);
        const headers = ["Event Name", "Total Guests", "Confirmed", "Checked In", "Views"];
        const rows = eventStats.map(e => [e.title, e.guests, e.confirmed, e.checkedIn, e.views]);
        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

        setTimeout(() => {
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `a2zcreative-report-${selectedRange}days.csv`;
            link.click();
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
                            <h1 className="text-2xl font-bold text-white">Analytics</h1>
                            <p className="text-foreground-muted">Track your event performance and views</p>
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
            <div className="p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Analytics</h1>
                        <p className="text-foreground-muted">Track your event performance and views</p>
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
                                <><CheckCircle className="w-4 h-4 text-success" /> Exported!</>
                            ) : isExporting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                            ) : (
                                <><Download className="w-4 h-4" /> Export</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Total Views</p>
                                <p className="text-2xl font-bold text-warning">{totalViews.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Total Guests</p>
                                <p className="text-2xl font-bold text-primary">{totalGuests}</p>
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
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Events</p>
                                <p className="text-2xl font-bold text-secondary">{analytics?.eventCount || eventStats.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Views Over Time */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Views Over Time</h2>
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <LineChart data={analytics?.viewsOverTime || []} />
                    </div>

                    {/* Device Breakdown */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Device Breakdown</h2>
                            <Smartphone className="w-5 h-5 text-foreground-muted" />
                        </div>
                        <DevicePie data={analytics?.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0 }} />
                    </div>
                </div>

                {/* Event Performance Table */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Event Performance</h2>
                        <BarChart3 className="w-5 h-5 text-foreground-muted" />
                    </div>
                    {eventStats.length === 0 ? (
                        <div className="p-8 text-center text-foreground-muted">No events to display</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-[var(--glass-border)]">
                                        <th className="text-left p-3 text-sm font-medium text-foreground-muted">Event</th>
                                        <th className="text-center p-3 text-sm font-medium text-foreground-muted">Views</th>
                                        <th className="text-center p-3 text-sm font-medium text-foreground-muted">Guests</th>
                                        <th className="text-center p-3 text-sm font-medium text-foreground-muted">Confirmed</th>
                                        <th className="text-left p-3 text-sm font-medium text-foreground-muted">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventStats.map((event) => {
                                        const rate = event.guests > 0 ? Math.round((event.confirmed / event.guests) * 100) : 0;
                                        return (
                                            <tr key={event.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)]">
                                                <td className="p-3 text-white font-medium">{event.title}</td>
                                                <td className="p-3 text-center text-warning">{event.views}</td>
                                                <td className="p-3 text-center text-foreground">{event.guests}</td>
                                                <td className="p-3 text-center text-success">{event.confirmed}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-background-tertiary rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${rate}%` }} />
                                                        </div>
                                                        <span className="text-xs text-foreground-muted">{rate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
