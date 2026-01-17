"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Mail, Clock, CheckCircle2, XCircle, Send, Filter, Calendar } from "lucide-react";

// Mock RSVP data
const mockRSVPs = [
    { id: 1, name: "Ahmad bin Ali", event: "Wedding Reception", status: "confirmed", pax: 4, respondedAt: "2024-01-15", message: "Can't wait! We'll be there." },
    { id: 2, name: "Siti Nurhaliza", event: "Wedding Reception", status: "pending", pax: 0, respondedAt: null, message: null },
    { id: 3, name: "Muhammad Haziq", event: "Birthday Party", status: "confirmed", pax: 1, respondedAt: "2024-01-14", message: "Happy to attend!" },
    { id: 4, name: "Nurul Izzah", event: "Corporate Event", status: "declined", pax: 0, respondedAt: "2024-01-13", message: "Sorry, I have a conflicting schedule." },
    { id: 5, name: "Amirul Hakim", event: "Wedding Reception", status: "confirmed", pax: 3, respondedAt: "2024-01-12", message: "Looking forward to it!" },
    { id: 6, name: "Farah Diana", event: "Birthday Party", status: "pending", pax: 0, respondedAt: null, message: null },
    { id: 7, name: "Zulkifli Rahman", event: "Wedding Reception", status: "confirmed", pax: 5, respondedAt: "2024-01-11", message: "Bringing the whole family!" },
    { id: 8, name: "Aishah Hasanah", event: "Corporate Event", status: "pending", pax: 0, respondedAt: null, message: null },
];

const statusConfig = {
    confirmed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/20", label: "Confirmed" },
    pending: { icon: Clock, color: "text-warning", bg: "bg-warning/20", label: "Pending" },
    declined: { icon: XCircle, color: "text-error", bg: "bg-error/20", label: "Declined" },
};

export default function RSVPPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredRSVPs = mockRSVPs.filter(rsvp => {
        const matchesSearch = rsvp.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || rsvp.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: mockRSVPs.length,
        confirmed: mockRSVPs.filter(r => r.status === "confirmed").length,
        pending: mockRSVPs.filter(r => r.status === "pending").length,
        declined: mockRSVPs.filter(r => r.status === "declined").length,
        totalPax: mockRSVPs.reduce((sum, r) => sum + r.pax, 0),
    };

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">RSVP Tracking</h1>
                        <p className="text-foreground-muted">Track and manage guest responses</p>
                    </div>
                    <button className="btn-primary flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Reminders
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Total Sent</p>
                                <p className="text-xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Confirmed</p>
                                <p className="text-xl font-bold text-success">{stats.confirmed}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Pending</p>
                                <p className="text-xl font-bold text-warning">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-error" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Declined</p>
                                <p className="text-xl font-bold text-error">{stats.declined}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Total Pax</p>
                                <p className="text-xl font-bold text-secondary">{stats.totalPax}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response Rate */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-foreground-muted text-sm">Response Rate</p>
                        <p className="text-white font-medium">{Math.round(((stats.confirmed + stats.declined) / stats.total) * 100)}%</p>
                    </div>
                    <div className="h-3 bg-background-tertiary rounded-full overflow-hidden flex">
                        <div className="h-full bg-success" style={{ width: `${(stats.confirmed / stats.total) * 100}%` }} />
                        <div className="h-full bg-error" style={{ width: `${(stats.declined / stats.total) * 100}%` }} />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-success">● Confirmed</span>
                        <span className="text-error">● Declined</span>
                        <span className="text-foreground-muted">● Pending</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                        <input
                            type="text"
                            placeholder="Search guests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-foreground-muted" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                </div>

                {/* RSVP List */}
                <div className="space-y-3">
                    {filteredRSVPs.map((rsvp) => {
                        const config = statusConfig[rsvp.status as keyof typeof statusConfig];
                        const StatusIcon = config.icon;
                        return (
                            <div key={rsvp.id} className="glass-card p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-white">{rsvp.name}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground-muted truncate">{rsvp.event}</p>
                                    {rsvp.message && (
                                        <p className="text-sm text-foreground-muted italic mt-1">&quot;{rsvp.message}&quot;</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    {rsvp.pax > 0 && (
                                        <p className="text-white font-medium">{rsvp.pax} pax</p>
                                    )}
                                    {rsvp.respondedAt && (
                                        <p className="text-xs text-foreground-muted">{rsvp.respondedAt}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
