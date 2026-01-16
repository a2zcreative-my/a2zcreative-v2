"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout";

// Mock data for published invitations
const publishedInvitations = [
    {
        id: "1",
        title: "Majlis Perkahwinan",
        eventType: "Wedding",
        date: "15 Feb 2026",
        plan: "premium",
        views: 342,
        rsvp: { confirmed: 124, pending: 45, declined: 12 },
        status: "live",
    },
    {
        id: "2",
        title: "Birthday Bash - Aiman",
        eventType: "Birthday",
        date: "28 Jan 2026",
        plan: "basic",
        views: 87,
        rsvp: { confirmed: 32, pending: 8, declined: 2 },
        status: "live",
    },
];

const draftEvents = [
    {
        id: "3",
        title: "Corporate Annual Dinner",
        eventType: "Corporate",
        plan: "exclusive",
        progress: 65,
    },
];

const stats = [
    { label: "Total Events", value: "12", icon: "📅", color: "primary" },
    { label: "Total Revenue", value: "RM 2,430", icon: "💰", color: "success" },
    { label: "Active Events", value: "3", icon: "✨", color: "warning" },
    { label: "Total Guests", value: "1,247", icon: "👥", color: "info" },
];

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Welcome Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, Organizer! 👋
                        </h1>
                        <p className="text-foreground-muted">
                            Manage your events and invitations from your dashboard
                        </p>
                    </div>
                    <Link href="/plans" className="btn-primary flex items-center gap-2">
                        ✨ Create New Event
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-lg bg-${stat.color}/20 text-${stat.color}`}>
                                    +12%
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-foreground-muted">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Published Invitations - PROMINENT */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            📨 Published Invitations
                        </h2>
                        <Link href="/events" className="text-primary text-sm hover:text-primary-hover">
                            View All →
                        </Link>
                    </div>

                    {publishedInvitations.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {publishedInvitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="glass-card glass-card-hover p-5 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`badge-${invitation.plan} text-xs font-bold px-2 py-0.5 rounded-full text-white`}>
                                                    {invitation.plan.toUpperCase()}
                                                </span>
                                                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                                                <span className="text-xs text-success">LIVE</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">{invitation.title}</h3>
                                            <p className="text-sm text-foreground-muted">{invitation.eventType} • {invitation.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">{invitation.views}</p>
                                            <p className="text-xs text-foreground-muted">views</p>
                                        </div>
                                    </div>

                                    {/* RSVP Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="text-center p-2 rounded-lg bg-success/10">
                                            <p className="text-lg font-bold text-success">{invitation.rsvp.confirmed}</p>
                                            <p className="text-xs text-foreground-muted">Confirmed</p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-warning/10">
                                            <p className="text-lg font-bold text-warning">{invitation.rsvp.pending}</p>
                                            <p className="text-xs text-foreground-muted">Pending</p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-error/10">
                                            <p className="text-lg font-bold text-error">{invitation.rsvp.declined}</p>
                                            <p className="text-xs text-foreground-muted">Declined</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/events/${invitation.id}/preview`}
                                            className="flex-1 btn-secondary text-center text-sm py-2"
                                        >
                                            👁️ Preview
                                        </Link>
                                        <Link
                                            href={`/events/${invitation.id}/rsvp`}
                                            className="flex-1 btn-secondary text-center text-sm py-2"
                                        >
                                            📊 RSVP
                                        </Link>
                                        <button className="btn-secondary text-sm py-2 px-3">
                                            📤
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <div className="text-5xl mb-4">📭</div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Published Invitations</h3>
                            <p className="text-foreground-muted mb-6">Create your first event and publish an invitation</p>
                            <Link href="/plans" className="btn-primary">
                                Create Event
                            </Link>
                        </div>
                    )}
                </div>

                {/* Draft Events */}
                {draftEvents.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            📝 Draft Events
                        </h2>
                        <div className="space-y-3">
                            {draftEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}/builder`}
                                    className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-all block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-${event.plan}/20 flex items-center justify-center text-lg`}>
                                            🏢
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{event.title}</h3>
                                            <p className="text-sm text-foreground-muted">{event.eventType} • {event.plan.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32">
                                            <div className="flex justify-between text-xs text-foreground-muted mb-1">
                                                <span>Progress</span>
                                                <span>{event.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                                    style={{ width: `${event.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-foreground-muted">→</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/plans" className="glass-card glass-card-hover p-4 text-center">
                            <div className="text-3xl mb-2">✨</div>
                            <p className="font-medium text-white">Create Event</p>
                        </Link>
                        <Link href="/events" className="glass-card glass-card-hover p-4 text-center">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="font-medium text-white">View All Events</p>
                        </Link>
                        <Link href="/guests" className="glass-card glass-card-hover p-4 text-center">
                            <div className="text-3xl mb-2">👥</div>
                            <p className="font-medium text-white">Manage Guests</p>
                        </Link>
                        <Link href="/reports" className="glass-card glass-card-hover p-4 text-center">
                            <div className="text-3xl mb-2">📈</div>
                            <p className="font-medium text-white">View Reports</p>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
