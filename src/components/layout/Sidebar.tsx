"use client";

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
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/events", label: "My Events", icon: Calendar },
    { href: "/plans", label: "Create Event", icon: PlusCircle },
    { href: "/guests", label: "Guests", icon: Users },
    { href: "/rsvp", label: "RSVP", icon: Mail },
    { href: "/checkin", label: "Check-In", icon: QrCode },
    { href: "/reports", label: "Reports", icon: BarChart3 },
];

const bottomNavItems = [
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        await signOut();
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

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-background-secondary border-r border-[var(--glass-border)] flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--glass-border)]">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden">
                        <Image src="/logo.png" alt="A2ZCreative" width={40} height={40} />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        A2ZCreative
                    </span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
            </nav>

            {/* Bottom Navigation */}
            <div className="p-4 space-y-1 border-t border-[var(--glass-border)]">
                {bottomNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-semibold">
                        {getUserInitial()}
                    </div>
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
    );
}
