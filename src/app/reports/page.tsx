"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { BarChart3, TrendingUp, Users, Calendar, Download, Eye, UserCheck, Percent, CheckCircle } from "lucide-react";

// Mock report data
const mockEventStats = [
    { name: "Wedding Reception", guests: 150, confirmed: 120, checkedIn: 95, views: 1250 },
    { name: "Birthday Party", guests: 45, confirmed: 38, checkedIn: 32, views: 320 },
    { name: "Corporate Event", guests: 80, confirmed: 55, checkedIn: 0, views: 450 },
];

const recentActivity = [
    { action: "RSVP Confirmed", guest: "Ahmad bin Ali", event: "Wedding Reception", time: "5 min ago" },
    { action: "Check-In", guest: "Amirul Hakim", event: "Wedding Reception", time: "10 min ago" },
    { action: "RSVP Declined", guest: "Nurul Izzah", event: "Corporate Event", time: "1 hour ago" },
    { action: "Invitation Viewed", guest: "Farah Diana", event: "Birthday Party", time: "2 hours ago" },
    { action: "RSVP Confirmed", guest: "Zulkifli Rahman", event: "Wedding Reception", time: "3 hours ago" },
];

const timeRanges = [
    { id: "7", label: "Last 7 Days", multiplier: 0.3 },
    { id: "30", label: "Last 30 Days", multiplier: 1 },
    { id: "90", label: "Last 90 Days", multiplier: 2.5 },
    { id: "all", label: "All Time", multiplier: 4 },
];

export default function ReportsPage() {
    const [selectedRange, setSelectedRange] = useState("30");
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    // Get multiplier for dynamic stats based on selected range
    const multiplier = timeRanges.find(r => r.id === selectedRange)?.multiplier || 1;

    const totalGuests = Math.round(mockEventStats.reduce((sum, e) => sum + e.guests, 0) * multiplier);
    const totalConfirmed = Math.round(mockEventStats.reduce((sum, e) => sum + e.confirmed, 0) * multiplier);
    const totalCheckedIn = Math.round(mockEventStats.reduce((sum, e) => sum + e.checkedIn, 0) * multiplier);
    const totalViews = Math.round(mockEventStats.reduce((sum, e) => sum + e.views, 0) * multiplier);

    // Handle export
    const handleExport = () => {
        setIsExporting(true);

        // Generate CSV content
        const headers = ["Event Name", "Total Guests", "Confirmed", "Checked In", "Views"];
        const rows = mockEventStats.map(e => [e.name, e.guests, e.confirmed, e.checkedIn, e.views]);
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
                            {mockEventStats.map((event, idx) => {
                                const confirmRate = Math.round((event.confirmed / event.guests) * 100);
                                return (
                                    <div key={idx} className="p-4 bg-background-tertiary rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-white">{event.name}</p>
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
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-background-tertiary rounded-lg">
                                    <div className={`w-2 h-2 mt-2 rounded-full ${activity.action.includes("Confirmed") ? "bg-success" :
                                        activity.action.includes("Declined") ? "bg-error" :
                                            activity.action.includes("Check") ? "bg-secondary" : "bg-warning"
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white">{activity.action}</p>
                                        <p className="text-xs text-foreground-muted truncate">{activity.guest} • {activity.event}</p>
                                    </div>
                                    <p className="text-xs text-foreground-muted whitespace-nowrap">{activity.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
