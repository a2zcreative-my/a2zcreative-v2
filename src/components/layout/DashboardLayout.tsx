"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Sidebar, { Menu } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, HelpCircle, X, Users, CreditCard, Calendar, Info, Shield, Loader2 } from "lucide-react";

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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const { isAdmin } = useAuth();

    const unreadCount = notifications.filter(n => !n.read).length;

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (notificationOpen && notifications.length === 0) {
            setLoadingNotifications(true);
            fetch('/api/client/notifications')
                .then(res => res.ok ? res.json() : { notifications: [] })
                .then(data => setNotifications(data.notifications || []))
                .catch(() => setNotifications([]))
                .finally(() => setLoadingNotifications(false));
        }
    }, [notificationOpen, notifications.length]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="md:ml-64 min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 border-b border-[var(--glass-border)] bg-background/80 backdrop-blur-xl">
                    <div className="h-full px-4 md:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-foreground-muted hover:text-white transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Admin Mode Badge */}
                            {isAdmin && (
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50">
                                    <Shield className="w-3.5 h-3.5 text-red-400" />
                                    <span className="text-xs font-bold text-red-400">ADMIN</span>
                                </div>
                            )}
                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setNotificationOpen(!notificationOpen)}
                                    className="relative w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-foreground-muted hover:text-white hover:border-primary/30 transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs font-bold text-white flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {notificationOpen && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background-secondary border border-[var(--glass-border)] rounded-2xl shadow-2xl overflow-hidden z-50">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
                                            <h3 className="font-semibold text-white">Notifications</h3>
                                            <button
                                                onClick={() => setNotificationOpen(false)}
                                                className="p-1 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Notification List */}
                                        <div className="max-h-80 overflow-y-auto">
                                            {loadingNotifications ? (
                                                <div className="p-8 text-center">
                                                    <Loader2 className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
                                                    <p className="text-sm text-foreground-muted">Loading...</p>
                                                </div>
                                            ) : notifications.length > 0 ? (
                                                notifications.map((notification) => {
                                                    const Icon = iconMap[notification.type] || Info;
                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-[var(--glass-border)] last:border-b-0 ${!notification.read ? "bg-primary/5" : ""
                                                                }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.type === "rsvp" ? "bg-success/20" :
                                                                notification.type === "payment" ? "bg-primary/20" :
                                                                    notification.type === "reminder" ? "bg-warning/20" :
                                                                        "bg-info/20"
                                                                }`}>
                                                                <Icon className={`w-4 h-4 ${notification.type === "rsvp" ? "text-success" :
                                                                    notification.type === "payment" ? "text-primary" :
                                                                        notification.type === "reminder" ? "text-warning" :
                                                                            "text-info"
                                                                    }`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className={`text-sm font-medium truncate ${!notification.read ? "text-white" : "text-foreground-muted"}`}>
                                                                        {notification.title}
                                                                    </p>
                                                                    {!notification.read && (
                                                                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-foreground-muted truncate">{notification.message}</p>
                                                                <p className="text-xs text-foreground-muted/60 mt-1">{notification.time}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <Bell className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                                                    <p className="text-sm text-foreground-muted">No notifications</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <Link
                                            href={isAdmin ? "/admin/notifications" : "/notifications"}
                                            onClick={() => setNotificationOpen(false)}
                                            className="block px-4 py-3 text-center text-sm text-primary hover:bg-white/5 border-t border-[var(--glass-border)]"
                                        >
                                            View all notifications
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Help - Only for clients */}
                            {!isAdmin && (
                                <Link
                                    href="/help"
                                    className="hidden sm:flex w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] items-center justify-center text-foreground-muted hover:text-white hover:border-primary/30 transition-colors"
                                >
                                    <HelpCircle className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
