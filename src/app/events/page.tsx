"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout";

const mockEvents = [
    { id: "1", title: "Majlis Perkahwinan Ahmad & Alia", type: "Wedding", date: "15 Feb 2026", plan: "premium", status: "live", views: 342, rsvp: 124 },
    { id: "2", title: "Birthday Bash - Aiman", type: "Birthday", date: "28 Jan 2026", plan: "basic", status: "live", views: 87, rsvp: 32 },
    { id: "3", title: "Corporate Annual Dinner", type: "Corporate", date: "20 Mar 2026", plan: "exclusive", status: "draft", views: 0, rsvp: 0 },
    { id: "4", title: "Aqiqah Baby Arya", type: "Aqiqah", date: "10 Dec 2025", plan: "starter", status: "completed", views: 156, rsvp: 45 },
];

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredEvents = mockEvents.filter(e => {
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
                        ✨ Create New Event
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

                {/* Events Grid */}
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
                                <p className="text-sm text-foreground-muted">{event.type} • {event.date}</p>
                            </div>

                            {/* Stats */}
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white">{event.views}</p>
                                    <p className="text-xs text-foreground-muted">Views</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-success">{event.rsvp}</p>
                                    <p className="text-xs text-foreground-muted">RSVP</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 pt-0 flex gap-2">
                                <Link href={`/events/${event.id}/preview`} className="flex-1 btn-secondary text-center text-sm py-2">
                                    👁️ View
                                </Link>
                                <Link href={`/events/${event.id}/builder`} className="flex-1 btn-secondary text-center text-sm py-2">
                                    ✏️ Edit
                                </Link>
                                <button className="btn-secondary text-sm py-2 px-3">
                                    ⋮
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredEvents.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
                        <p className="text-foreground-muted mb-6">
                            {searchQuery ? "Try a different search term" : "Create your first event to get started"}
                        </p>
                        <Link href="/plans" className="btn-primary">
                            Create Event
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
