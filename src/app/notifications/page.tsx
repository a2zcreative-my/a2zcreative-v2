"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { Bell, Check, Calendar, Users, CreditCard, Info, Loader2 } from "lucide-react";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const iconMap: Record<string, typeof Bell> = {
    rsvp: Users,
    payment: CreditCard,
    reminder: Calendar,
    info: Info,
};

const colorMap: Record<string, { bg: string; text: string }> = {
    rsvp: { bg: "bg-success/20", text: "text-success" },
    payment: { bg: "bg-primary/20", text: "text-primary" },
    reminder: { bg: "bg-warning/20", text: "text-warning" },
    info: { bg: "bg-info/20", text: "text-info" },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingRead, setMarkingRead] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const response = await fetch('/api/client/notifications');
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications || []);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        setMarkingRead(true);
        try {
            const response = await fetch('/api/client/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true })
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        } finally {
            setMarkingRead(false);
        }
    };

    const handleMarkRead = async (notificationId: string) => {
        try {
            const response = await fetch('/api/client/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                ));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 animate-fade-in max-w-3xl">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            Notifications
                        </h1>
                        <p className="text-foreground-muted">Loading notifications...</p>
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
            <div className="space-y-6 animate-fade-in max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            Notifications
                        </h1>
                        <p className="text-foreground-muted">
                            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            disabled={markingRead}
                            className="btn-secondary text-sm flex items-center gap-2"
                        >
                            {markingRead ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notification) => {
                            const Icon = iconMap[notification.type] || Info;
                            const colors = colorMap[notification.type] || colorMap.info;
                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.read && handleMarkRead(notification.id)}
                                    className={`glass-card p-4 flex items-start gap-4 cursor-pointer hover:border-primary/30 transition-all ${!notification.read ? "border-l-4 border-l-primary" : ""
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
                                        <Icon className={`w-5 h-5 ${colors.text}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={`font-medium ${!notification.read ? "text-white" : "text-foreground-muted"}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground-muted mt-1">{notification.message}</p>
                                        <p className="text-xs text-foreground-muted/60 mt-2">{notification.time}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="glass-card p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
                        <p className="text-foreground-muted">You're all caught up! Check back later.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
