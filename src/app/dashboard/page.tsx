"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import QRCode from "qrcode";
import {
    Calendar,
    Sparkles,
    Users,
    Send,
    FileEdit,
    Eye,
    BarChart3,
    Share2,
    Building2,
    Loader2,
    Timer,
    Download,
    Crown,
    ArrowUpRight,
    Activity,
} from "lucide-react";

interface PublishedInvitation {
    id: string;
    title: string;
    eventType: string;
    date: string;
    plan: string;
    views: number;
    rsvp: { confirmed: number; pending: number; declined: number };
    status: string;
}

interface DraftEvent {
    id: string;
    title: string;
    eventType: string;
    plan: string;
    progress: number;
}

interface DashboardData {
    stats: {
        totalEvents: number;
        totalViews: number;
        activeEvents: number;
        totalRsvps: number;
    };
    publishedInvitations: PublishedInvitation[];
    draftEvents: DraftEvent[];
    userPlan?: {
        name: string;
        id: string;
    };
    nextEvent?: {
        id: string;
        title: string;
        date: string;
    };
}

interface CountdownTime {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface Activity {
    id: string;
    type: 'rsvp' | 'view' | 'notification' | 'guest';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

function calculateCountdown(targetDate: string): CountdownTime {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
}

function formatTimeAgo(timestamp: string): string {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState<CountdownTime | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [data, setData] = useState<DashboardData>({
        stats: { totalEvents: 0, totalViews: 0, activeEvents: 0, totalRsvps: 0 },
        publishedInvitations: [],
        draftEvents: []
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [dashResponse, activityResponse] = await Promise.all([
                    fetch('/api/client/dashboard'),
                    fetch('/api/client/activity')
                ]);

                if (dashResponse.ok) {
                    const result = await dashResponse.json();
                    setData(result);
                }

                if (activityResponse.ok) {
                    const activityData = await activityResponse.json();
                    setActivities(activityData.activities || []);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Countdown timer effect
    useEffect(() => {
        if (!data.nextEvent?.date) return;

        const updateCountdown = () => {
            setCountdown(calculateCountdown(data.nextEvent!.date));
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [data.nextEvent]);

    // QR Code download function
    const downloadQR = async (eventId: string, eventTitle: string) => {
        try {
            const url = `${window.location.origin}/${eventId}`;
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 512,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            });

            const link = document.createElement('a');
            link.download = `${eventTitle.replace(/\s+/g, '-')}-QR.png`;
            link.href = qrDataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        }
    };

    const stats = [
        { label: "My Events", value: data.stats.totalEvents.toString(), icon: Calendar, color: "primary", bgColor: "bg-primary/20" },
        { label: "Total Views", value: data.stats.totalViews.toString(), icon: Eye, color: "success", bgColor: "bg-success/20" },
        { label: "Active Events", value: data.stats.activeEvents.toString(), icon: Sparkles, color: "warning", bgColor: "bg-warning/20" },
        { label: "Total RSVPs", value: data.stats.totalRsvps.toString(), icon: Users, color: "info", bgColor: "bg-info/20" },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back!</h1>
                        <p className="text-foreground-muted">Manage your events and track your invitations</p>
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
            <div className="space-y-8 animate-fade-in">
                {/* Welcome Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Welcome back!
                    </h1>
                    <p className="text-foreground-muted">
                        Manage your events and track your invitations
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="glass-card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 text-${stat.color}`} strokeWidth={1.5} />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-lg bg-${stat.color}/20 text-${stat.color}`}>
                                        +12%
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-foreground-muted">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Countdown Widget + Plan CTA Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Event Countdown Widget */}
                    {data.nextEvent && countdown && (
                        <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Timer className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {data.nextEvent.title}
                                    </h3>
                                    <p className="text-sm text-foreground-muted">
                                        {new Date(data.nextEvent.date).toLocaleDateString('en-MY', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3 text-center">
                                <div className="bg-background/50 rounded-xl p-3">
                                    <p className="text-3xl font-bold text-white">{countdown.days}</p>
                                    <p className="text-xs text-foreground-muted uppercase">Days</p>
                                </div>
                                <div className="bg-background/50 rounded-xl p-3">
                                    <p className="text-3xl font-bold text-white">{countdown.hours}</p>
                                    <p className="text-xs text-foreground-muted uppercase">Hours</p>
                                </div>
                                <div className="bg-background/50 rounded-xl p-3">
                                    <p className="text-3xl font-bold text-white">{countdown.minutes}</p>
                                    <p className="text-xs text-foreground-muted uppercase">Mins</p>
                                </div>
                                <div className="bg-background/50 rounded-xl p-3">
                                    <p className="text-3xl font-bold text-primary animate-pulse">{countdown.seconds}</p>
                                    <p className="text-xs text-foreground-muted uppercase">Secs</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Plan Upgrade CTA */}
                    <div className="glass-card p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-warning" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Your Plan</h3>
                                    <p className="text-sm text-foreground-muted capitalize">
                                        {data.userPlan?.name || 'Starter Pack'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground-muted">Events Created</span>
                                    <span className="text-white font-medium">{data.stats.totalEvents}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground-muted">Total Views</span>
                                    <span className="text-white font-medium">{data.stats.totalViews}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground-muted">Total RSVPs</span>
                                    <span className="text-white font-medium">{data.stats.totalRsvps}</span>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/plans"
                            className="btn-primary w-full text-center flex items-center justify-center gap-2"
                        >
                            Upgrade Plan
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Activity Feed - beside Plan Card */}
                    <div className="glass-card p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Recent Activity
                            </h3>
                            <Link href="/notifications" className="text-xs text-primary hover:text-primary-hover">
                                View All
                            </Link>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {activities.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {activities.slice(0, 5).map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-2 p-2 rounded-lg bg-background-tertiary/50"
                                        >
                                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 ${activity.type === 'rsvp' ? 'bg-success/20 text-success' :
                                                activity.type === 'notification' ? 'bg-primary/20 text-primary' :
                                                    'bg-secondary/20 text-secondary'
                                                }`}>
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-white truncate">{activity.title}</p>
                                                <p className="text-xs text-foreground-muted truncate">{activity.description}</p>
                                            </div>
                                            <span className="text-xs text-foreground-muted whitespace-nowrap">
                                                {formatTimeAgo(activity.timestamp)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-foreground-muted">
                                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Published Invitations - PROMINENT */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Published Invitations
                        </h2>
                        <Link href="/events" className="text-primary text-sm hover:text-primary-hover">
                            View All →
                        </Link>
                    </div>

                    {data.publishedInvitations.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {data.publishedInvitations.map((invitation) => (
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
                                            className="flex-1 btn-secondary text-center text-sm py-2 flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Preview
                                        </Link>
                                        <Link
                                            href={`/events/${invitation.id}/rsvp`}
                                            className="flex-1 btn-secondary text-center text-sm py-2 flex items-center justify-center gap-2"
                                        >
                                            <BarChart3 className="w-4 h-4" />
                                            RSVP
                                        </Link>
                                        <button
                                            onClick={() => downloadQR(invitation.id, invitation.title)}
                                            className="btn-secondary text-sm py-2 px-3"
                                            title="Download QR Code"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="btn-secondary text-sm py-2 px-3" title="Share">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Published Invitations</h3>
                            <p className="text-foreground-muted mb-6">Create your first event and publish an invitation</p>
                            <Link href="/plans" className="btn-primary">
                                Create Event
                            </Link>
                        </div>
                    )}
                </div>

                {/* Draft Events */}
                {data.draftEvents.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <FileEdit className="w-5 h-5 text-warning" />
                            Draft Events
                        </h2>
                        <div className="space-y-3">
                            {data.draftEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}/builder`}
                                    className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-all block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-warning" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{event.title}</h3>
                                            <p className="text-sm text-foreground-muted">{event.eventType} • {event.plan.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <div className="w-20 sm:w-32">
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
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/guests" className="glass-card glass-card-hover p-4 text-center">
                            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-2">
                                <Users className="w-6 h-6 text-accent" />
                            </div>
                            <p className="font-medium text-white">Manage Guests</p>
                        </Link>
                        <Link href="/reports" className="glass-card glass-card-hover p-4 text-center">
                            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-2">
                                <BarChart3 className="w-6 h-6 text-success" />
                            </div>
                            <p className="font-medium text-white">View Reports</p>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
