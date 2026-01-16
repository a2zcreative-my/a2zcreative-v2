"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState, use } from "react";

const rsvpData = [
    { id: "1", name: "Ahmad bin Ali", email: "ahmad@email.com", status: "confirmed", pax: 4, timestamp: "2 hours ago", notes: "Halal food please" },
    { id: "2", name: "Siti binti Hassan", email: "siti@email.com", status: "confirmed", pax: 2, timestamp: "5 hours ago", notes: "" },
    { id: "3", name: "Tan Wei Ming", email: "weiming@email.com", status: "viewed", pax: 0, timestamp: "1 day ago", notes: "" },
    { id: "4", name: "Raj Kumar", email: "raj@email.com", status: "declined", pax: 0, timestamp: "2 days ago", notes: "Out of town" },
    { id: "5", name: "Fatimah binti Osman", email: "fatimah@email.com", status: "pending", pax: 0, timestamp: "Sent", notes: "" },
];

export default function RSVPPage() {
    const params = useParams(); const id = params?.id as string;
    const [filter, setFilter] = useState<string>("all");

    const stats = {
        total: rsvpData.length,
        confirmed: rsvpData.filter(r => r.status === "confirmed").length,
        pending: rsvpData.filter(r => r.status === "pending").length,
        declined: rsvpData.filter(r => r.status === "declined").length,
        viewed: rsvpData.filter(r => r.status === "viewed").length,
        totalPax: rsvpData.reduce((sum, r) => sum + r.pax, 0),
    };

    const filteredData = filter === "all" ? rsvpData : rsvpData.filter(r => r.status === filter);

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <Link href="/dashboard" className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    ← Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">RSVP Monitoring</h1>
                        <p className="text-foreground-muted">Track responses in real-time</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary">
                            📤 Export Data
                        </button>
                        <button className="btn-secondary">
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="glass-card p-4 text-center">
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-foreground-muted">Total Sent</p>
                </div>
                <div className="glass-card p-4 text-center border-success/30">
                    <p className="text-3xl font-bold text-success">{stats.confirmed}</p>
                    <p className="text-sm text-foreground-muted">Confirmed</p>
                </div>
                <div className="glass-card p-4 text-center border-info/30">
                    <p className="text-3xl font-bold text-info">{stats.viewed}</p>
                    <p className="text-sm text-foreground-muted">Viewed</p>
                </div>
                <div className="glass-card p-4 text-center border-warning/30">
                    <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                    <p className="text-sm text-foreground-muted">Pending</p>
                </div>
                <div className="glass-card p-4 text-center border-error/30">
                    <p className="text-3xl font-bold text-error">{stats.declined}</p>
                    <p className="text-sm text-foreground-muted">Declined</p>
                </div>
                <div className="glass-card p-4 text-center border-primary/30">
                    <p className="text-3xl font-bold text-primary">{stats.totalPax}</p>
                    <p className="text-sm text-foreground-muted">Total Pax</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex flex-wrap gap-2">
                    {["all", "confirmed", "viewed", "pending", "declined"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm capitalize transition-all ${filter === status
                                    ? "bg-primary text-white"
                                    : "bg-background-tertiary text-foreground-muted hover:text-white"
                                }`}
                        >
                            {status === "all" ? "All Responses" : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Response List */}
            <div className="max-w-6xl mx-auto space-y-3">
                {filteredData.map((response) => (
                    <div key={response.id} className="glass-card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${response.status === "confirmed" ? "bg-success" :
                                    response.status === "viewed" ? "bg-info" :
                                        response.status === "pending" ? "bg-warning" :
                                            "bg-error"
                                }`}>
                                {response.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-white">{response.name}</p>
                                <p className="text-sm text-foreground-muted">{response.email}</p>
                                {response.notes && (
                                    <p className="text-xs text-primary mt-1">📝 {response.notes}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {response.status === "confirmed" && (
                                <div className="text-right">
                                    <p className="text-lg font-bold text-white">{response.pax}</p>
                                    <p className="text-xs text-foreground-muted">pax</p>
                                </div>
                            )}
                            <div className="text-right">
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${response.status === "confirmed" ? "bg-success/20 text-success" :
                                        response.status === "viewed" ? "bg-info/20 text-info" :
                                            response.status === "pending" ? "bg-warning/20 text-warning" :
                                                "bg-error/20 text-error"
                                    }`}>
                                    {response.status.toUpperCase()}
                                </span>
                                <p className="text-xs text-foreground-muted mt-1">{response.timestamp}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="max-w-6xl mx-auto mt-8 flex gap-4">
                <Link href={`/events/${id}/checkin`} className="btn-primary flex-1 text-center">
                    📱 Go to Check-In
                </Link>
                <Link href={`/events/${id}/send`} className="btn-secondary flex-1 text-center">
                    📧 Send Reminders
                </Link>
            </div>
        </div>
    );
}


