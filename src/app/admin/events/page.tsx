"use client";

import {
    Calendar,
    Eye,
    Users,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Trash2,
} from "lucide-react";
import { useState } from "react";

// Mock data for all platform events
const allEvents = [
    {
        id: "1",
        title: "Majlis Perkahwinan Ahmad & Siti",
        owner: "Ahmad bin Hassan",
        ownerEmail: "ahmad@example.com",
        eventType: "Wedding",
        date: "15 Feb 2026",
        plan: "premium",
        views: 342,
        rsvpCount: 181,
        status: "published",
        createdAt: "2026-01-10",
    },
    {
        id: "2",
        title: "Birthday Bash - Aiman",
        owner: "Fatimah Lee",
        ownerEmail: "fatimah@example.com",
        eventType: "Birthday",
        date: "28 Jan 2026",
        plan: "basic",
        views: 87,
        rsvpCount: 42,
        status: "published",
        createdAt: "2026-01-08",
    },
    {
        id: "3",
        title: "Corporate Annual Dinner",
        owner: "TechCorp Sdn Bhd",
        ownerEmail: "hr@techcorp.com",
        eventType: "Corporate",
        date: "20 Mar 2026",
        plan: "exclusive",
        views: 0,
        rsvpCount: 0,
        status: "draft",
        createdAt: "2026-01-15",
    },
    {
        id: "4",
        title: "Hari Raya Open House",
        owner: "Zainab Abdullah",
        ownerEmail: "zainab@example.com",
        eventType: "Celebration",
        date: "10 Apr 2026",
        plan: "premium",
        views: 156,
        rsvpCount: 89,
        status: "published",
        createdAt: "2026-01-12",
    },
];

const stats = [
    { label: "Total Events", value: "47", icon: Calendar, color: "primary", bgColor: "bg-primary/20" },
    { label: "Published", value: "38", icon: Eye, color: "success", bgColor: "bg-success/20" },
    { label: "Total RSVPs", value: "2,847", icon: Users, color: "info", bgColor: "bg-info/20" },
];

export default function AdminEventsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredEvents = allEvents.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.owner.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || event.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    All Events
                </h1>
                <p className="text-foreground-muted">
                    Manage all events across the platform
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 text-${stat.color}`} strokeWidth={1.5} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-foreground-muted">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                        type="text"
                        placeholder="Search events or owners..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-foreground-muted" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Events Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--glass-border)]">
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Event</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Owner</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Plan</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Views</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">RSVPs</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map((event) => (
                                <tr key={event.id} className="border-b border-[var(--glass-border)] hover:bg-white/5">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-white">{event.title}</p>
                                            <p className="text-sm text-foreground-muted">{event.eventType} • {event.date}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="text-white">{event.owner}</p>
                                            <p className="text-sm text-foreground-muted">{event.ownerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge-${event.plan} text-xs font-bold px-2 py-1 rounded-full text-white`}>
                                            {event.plan.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${event.status === "published"
                                            ? "bg-success/20 text-success"
                                            : "bg-warning/20 text-warning"
                                            }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white">{event.views.toLocaleString()}</td>
                                    <td className="p-4 text-white">{event.rsvpCount.toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
