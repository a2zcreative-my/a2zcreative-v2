"use client";

import { DashboardLayout } from "@/components/layout";
import { Bell, Check, Calendar, Users, CreditCard, Info } from "lucide-react";

// Mock notifications data
const notifications = [
    {
        id: "1",
        type: "rsvp",
        title: "New RSVP Received",
        message: "Ahmad confirmed attendance for Majlis Perkahwinan",
        time: "5 minutes ago",
        read: false,
        icon: Users,
    },
    {
        id: "2",
        type: "payment",
        title: "Payment Successful",
        message: "Your Premium plan payment of RM150 was successful",
        time: "2 hours ago",
        read: false,
        icon: CreditCard,
    },
    {
        id: "3",
        type: "reminder",
        title: "Event Reminder",
        message: "Birthday Bash - Aiman is in 10 days",
        time: "1 day ago",
        read: true,
        icon: Calendar,
    },
    {
        id: "4",
        type: "info",
        title: "Welcome to A2ZCreative!",
        message: "Thank you for signing up. Start creating your first event.",
        time: "3 days ago",
        read: true,
        icon: Info,
    },
];

export default function NotificationsPage() {
    const unreadCount = notifications.filter(n => !n.read).length;

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
                        <button className="btn-secondary text-sm flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                            <div
                                key={notification.id}
                                className={`glass-card p-4 flex items-start gap-4 cursor-pointer hover:border-primary/30 transition-all ${!notification.read ? "border-l-4 border-l-primary" : ""
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notification.type === "rsvp" ? "bg-success/20" :
                                        notification.type === "payment" ? "bg-primary/20" :
                                            notification.type === "reminder" ? "bg-warning/20" :
                                                "bg-info/20"
                                    }`}>
                                    <Icon className={`w-5 h-5 ${notification.type === "rsvp" ? "text-success" :
                                            notification.type === "payment" ? "text-primary" :
                                                notification.type === "reminder" ? "text-warning" :
                                                    "text-info"
                                        }`} />
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

                {/* Empty State */}
                {notifications.length === 0 && (
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
