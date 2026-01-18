"use client";

import Link from "next/link";
import {
    TrendingUp,
    DollarSign,
    Users,
    Calendar,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    CreditCard,
    Activity,
} from "lucide-react";

// Mock admin data - in production this would come from API
const platformStats = {
    totalRevenue: 45230.00,
    revenueGrowth: 12.5,
    totalUsers: 156,
    newUsersThisMonth: 23,
    totalEvents: 342,
    activeEvents: 47,
    totalInvoices: 289,
    pendingPayments: 12,
};

const recentTransactions = [
    { id: "INV-2026-001", user: "Ahmad bin Ali", amount: 99.00, date: "18 Jan 2026", status: "paid" },
    { id: "INV-2026-002", user: "Nurul Aina", amount: 49.00, date: "17 Jan 2026", status: "paid" },
    { id: "INV-2026-003", user: "Farah Diana", amount: 199.00, date: "16 Jan 2026", status: "pending" },
    { id: "INV-2026-004", user: "Razak Hassan", amount: 99.00, date: "15 Jan 2026", status: "paid" },
    { id: "INV-2026-005", user: "Siti Aminah", amount: 49.00, date: "14 Jan 2026", status: "paid" },
];

const topUsers = [
    { name: "Ahmad bin Ali", events: 12, revenue: 1240.00 },
    { name: "Nurul Aina", events: 8, revenue: 890.00 },
    { name: "Farah Diana", events: 6, revenue: 720.00 },
    { name: "Razak Hassan", events: 5, revenue: 495.00 },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-fade-in pt-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-foreground-muted">
                    Platform overview and analytics
                </p>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-success" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-success/20 text-success flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            {platformStats.revenueGrowth}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">RM {platformStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-foreground-muted">Total Revenue</p>
                </div>

                {/* Total Users */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-primary/20 text-primary">
                            +{platformStats.newUsersThisMonth} this month
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{platformStats.totalUsers}</p>
                    <p className="text-sm text-foreground-muted">Total Users</p>
                </div>

                {/* Total Events */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-secondary/20 text-secondary">
                            {platformStats.activeEvents} active
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{platformStats.totalEvents}</p>
                    <p className="text-sm text-foreground-muted">Total Events</p>
                </div>

                {/* Invoices */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-warning" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-warning/20 text-warning">
                            {platformStats.pendingPayments} pending
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{platformStats.totalInvoices}</p>
                    <p className="text-sm text-foreground-muted">Total Invoices</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Recent Transactions
                        </h2>
                        <Link href="/admin/invoices" className="text-primary text-sm hover:text-primary-hover">
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary/50">
                                <div>
                                    <p className="font-medium text-white">{tx.user}</p>
                                    <p className="text-xs text-foreground-muted">{tx.id} • {tx.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-white">RM {tx.amount.toFixed(2)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'paid'
                                            ? 'bg-success/20 text-success'
                                            : 'bg-warning/20 text-warning'
                                        }`}>
                                        {tx.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Users */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-success" />
                            Top Users by Revenue
                        </h2>
                        <Link href="/admin/users" className="text-primary text-sm hover:text-primary-hover">
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {topUsers.map((user, idx) => (
                            <div key={user.name} className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{user.name}</p>
                                        <p className="text-xs text-foreground-muted">{user.events} events</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-success">RM {user.revenue.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Admin Actions */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin/users" className="glass-card glass-card-hover p-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-medium text-white">Manage Users</p>
                    </Link>
                    <Link href="/admin/invoices" className="glass-card glass-card-hover p-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-2">
                            <FileText className="w-6 h-6 text-success" />
                        </div>
                        <p className="font-medium text-white">All Invoices</p>
                    </Link>
                    <Link href="/admin/events" className="glass-card glass-card-hover p-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-2">
                            <Calendar className="w-6 h-6 text-secondary" />
                        </div>
                        <p className="font-medium text-white">All Events</p>
                    </Link>
                    <Link href="/admin/analytics" className="glass-card glass-card-hover p-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center mx-auto mb-2">
                            <Activity className="w-6 h-6 text-warning" />
                        </div>
                        <p className="font-medium text-white">Analytics</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
