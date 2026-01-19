"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Calendar,
    PlusCircle,
    Users,
    Mail,
    QrCode,
    BarChart3,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    Ticket,
    Bell,
    Package,
} from "lucide-react";

const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/events", label: "All Events", icon: Calendar },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/plans", label: "Plans", icon: Package },
    { href: "/admin/tickets", label: "Tickets", icon: Ticket },
    { href: "/admin/revenue", label: "Revenue", icon: BarChart3 },
];

const clientNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/events", label: "My Events", icon: Calendar },
    { href: "/guests", label: "Guests", icon: Users },
    { href: "/rsvp", label: "RSVP", icon: Mail },
    { href: "/checkin", label: "Check-In", icon: QrCode },
    { href: "/reports", label: "Reports", icon: BarChart3 },
];

const clientBottomNavItems = [
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
];

const adminBottomNavItems = [
    { href: "/admin/billing", label: "Billing", icon: CreditCard },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, signOut, isAdmin, roleLoading, persistentAvatarUrl } = useAuth();

    // Select navigation items based on role
    const navItems = isAdmin ? adminNavItems : clientNavItems;
    const bottomNavItems = isAdmin ? adminBottomNavItems : clientBottomNavItems;

    const isActive = (href: string) => {
        // For dashboard links, use exact match only
        if (href === "/dashboard" || href === "/admin") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } finally {
            window.location.href = '/auth/login';
        }
    };

    // Get user initials
    const getUserInitial = () => {
        if (user?.user_metadata?.name) {
            return user.user_metadata.name.charAt(0).toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return "U";
    };

    const getUserName = () => {
        return user?.user_metadata?.name || user?.email?.split('@')[0] || "User";
    };

    const handleNavClick = () => {
        // Close sidebar on mobile when navigating
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-64 bg-background-secondary border-r border-[var(--glass-border)] flex flex-col z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3" onClick={handleNavClick}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                            <Image src="/logo.png" alt="A2ZCreative" width={40} height={40} />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            A2ZCreative
                        </span>
                    </Link>
                    {/* Mobile close button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-lg hover:bg-[var(--glass-bg)] text-foreground-muted hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {roleLoading ? (
                        // Skeleton loading placeholders
                        <>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl">
                                    <div className="w-5 h-5 rounded bg-foreground-muted/20 animate-pulse" />
                                    <div className="h-4 rounded bg-foreground-muted/20 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                                </div>
                            ))}
                        </>
                    ) : (
                        navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={handleNavClick}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive(item.href)
                                        ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30"
                                        : "text-foreground-muted hover:bg-[var(--glass-bg)] hover:text-white"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })
                    )}
                </nav>

                {/* Bottom Navigation */}
                <div className="p-4 space-y-1 border-t border-[var(--glass-border)]">
                    {bottomNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleNavClick}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive(item.href)
                                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30"
                                    : "text-foreground-muted hover:bg-[var(--glass-bg)] hover:text-white"
                                    }`}
                            >
                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Profile with Logout */}
                <div className="p-4 border-t border-[var(--glass-border)]">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--glass-bg)]">
                        {persistentAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                <img
                                    src={persistentAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                                    alt={getUserName()}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-semibold">
                                {getUserInitial()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{getUserName()}</p>
                            <p className="text-xs text-foreground-muted truncate">Pro Plan</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// Export menu icon for use in DashboardLayout
export { Menu };
