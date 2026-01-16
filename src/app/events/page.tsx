"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import {
    PlusCircle,
    Eye,
    Pencil,
    MoreVertical,
    AlertTriangle,
    Inbox,
} from "lucide-react";

interface Event {
    id: string;
    title: string;
    type: string;
    event_date: string;
    plan: string;
    status: string;
    views: number;
    rsvp_count: number;
}

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Fetch user's events from API
    useEffect(() => {
        async function fetchEvents() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/events');
                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setEvents(data.events || []);
                }
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('Failed to load events');
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [user]);

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
                        <p className="text-foreground-muted">Manage all your events in one place</p>
                    </div>
                    <Link href="/plans" className="btn-primary flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Create New Event
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["all", "live", "draft", "completed"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl font-medium text-sm capitalize transition-all ${statusFilter === status
                                    ? "bg-primary text-white"
                                    : "bg-background-tertiary text-foreground-muted hover:text-white"
                                    }`}
                            >
                                {status === "all" ? "All Events" : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="glass-card p-12 text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-foreground-muted">Loading events...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="glass-card p-12 text-center border-red-500/30">
                        <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-error" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Events</h3>
                        <p className="text-foreground-muted">{error}</p>
                    </div>
                )}

                {/* Events Grid */}
                {!loading && !error && filteredEvents.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEvents.map((event) => (
                            <div key={event.id} className="glass-card glass-card-hover overflow-hidden">
                                {/* Event Header */}
                                <div className="p-4 border-b border-[var(--glass-border)]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`badge-${event.plan} text-xs font-bold px-2 py-0.5 rounded-full text-white`}>
                                            {event.plan.toUpperCase()}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === "live" ? "bg-success/20 text-success" :
                                            event.status === "draft" ? "bg-warning/20 text-warning" :
                                                "bg-foreground-muted/20 text-foreground-muted"
                                            }`}>
                                            {event.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                                    <p className="text-sm text-foreground-muted">{event.type} • {event.event_date}</p>
                                </div>

                                {/* Stats */}
                                <div className="p-4 grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-white">{event.views || 0}</p>
                                        <p className="text-xs text-foreground-muted">Views</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-success">{event.rsvp_count || 0}</p>
                                        <p className="text-xs text-foreground-muted">RSVP</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 pt-0 flex gap-2">
                                    <Link href={`/events/${event.id}/preview`} className="flex-1 btn-secondary text-center text-sm py-2 flex items-center justify-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        View
                                    </Link>
                                    <Link href={`/events/${event.id}/builder`} className="flex-1 btn-secondary text-center text-sm py-2 flex items-center justify-center gap-2">
                                        <Pencil className="w-4 h-4" />
                                        Edit
                                    </Link>
                                    <button className="btn-secondary text-sm py-2 px-3">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredEvents.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
                        <p className="text-foreground-muted mb-6">
                            {searchQuery ? "Try a different search term" : "Create your first event to get started"}
                        </p>
                        <Link href="/plans" className="btn-primary inline-flex items-center gap-2">
                            <PlusCircle className="w-5 h-5" />
                            Create Event
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
