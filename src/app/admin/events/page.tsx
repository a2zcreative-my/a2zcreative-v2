"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Eye,
    Users,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Trash2,
    Loader2,
    AlertTriangle,
} from "lucide-react";

interface Event {
    id: string;
    title: string;
    owner: string;
    ownerEmail: string;
    eventType: string;
    date: string;
    plan: string;
    views: number;
    rsvpCount: number;
    status: string;
    createdAt: string;
}

interface Stats {
    totalEvents: number;
    publishedEvents: number;
    totalRsvps: number;
}

export default function AdminEventsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [events, setEvents] = useState<Event[]>([]);
    const [stats, setStats] = useState<Stats>({ totalEvents: 0, publishedEvents: 0, totalRsvps: 0 });

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/admin/events');
                const data = await response.json();

                if (!response.ok) {
                    // Only throw if it's a real error (401, 403, 500), not empty data
                    if (response.status === 401 || response.status === 403) {
                        throw new Error(data.error || 'Unauthorized');
                    }
                    // For other errors, just use empty data
                    console.error('API error:', data.error);
                }

                setStats(data.stats || { totalEvents: 0, publishedEvents: 0, totalRsvps: 0 });
                setEvents(data.events || []);
            } catch (err) {
                console.error('Fetch error:', err);
                // Don't show error for fetch failures, just empty state
                setStats({ totalEvents: 0, publishedEvents: 0, totalRsvps: 0 });
                setEvents([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.owner.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || event.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const statItems = [
        { label: "Total Events", value: stats.totalEvents.toString(), icon: Calendar, color: "primary", bgColor: "bg-primary/20" },
        { label: "Published", value: stats.publishedEvents.toString(), icon: Eye, color: "success", bgColor: "bg-success/20" },
        { label: "Total RSVPs", value: stats.totalRsvps.toLocaleString(), icon: Users, color: "info", bgColor: "bg-info/20" },
    ];

    if (loading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">All Events</h1>
                    <p className="text-foreground-muted">Manage all events across the platform</p>
                </div>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">All Events</h1>
                </div>
                <div className="glass-card p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
                    <p className="text-error font-medium">Failed to load events</p>
                    <p className="text-foreground-muted text-sm mt-2">{error}</p>
                </div>
            </div>
        );
    }

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
                {statItems.map((stat) => {
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
            {filteredEvents.length > 0 ? (
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
                                                <p className="text-sm text-foreground-muted">{event.eventType} • {formatDate(event.date)}</p>
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
            ) : (
                <div className="glass-card p-12 text-center">
                    <Calendar className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
                    <p className="text-foreground-muted">
                        {searchQuery || statusFilter !== "all"
                            ? "No events match your current filters."
                            : "No events have been created yet."}
                    </p>
                </div>
            )}
        </div>
    );
}
