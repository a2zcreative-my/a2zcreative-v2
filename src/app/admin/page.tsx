"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    TrendingUp,
    DollarSign,
    Users,
    Calendar,
    FileText,
    ArrowUpRight,
    CreditCard,
    Activity,
    Loader2,
    AlertTriangle,
} from "lucide-react";

interface PlatformStats {
    totalRevenue: number;
    totalUsers: number;
    newUsersThisMonth: number;
    totalEvents: number;
    activeEvents: number;
    totalInvoices: number;
    pendingPayments: number;
}

interface Transaction {
    id: string;
    user: string;
    amount: number;
    date: string;
    status: string;
}

interface TopUser {
    name: string;
    events: number;
    revenue: number;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<PlatformStats>({
        totalRevenue: 0,
        totalUsers: 0,
        newUsersThisMonth: 0,
        totalEvents: 0,
        activeEvents: 0,
        totalInvoices: 0,
        pendingPayments: 0
    });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [topUsers, setTopUsers] = useState<TopUser[]>([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/admin/stats');

                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const data = await response.json();
                setStats(data.stats);
                setRecentTransactions(data.recentTransactions || []);
                setTopUsers(data.topUsers || []);
            } catch (err) {
                setError(String(err));
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    // Format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-fade-in pt-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-foreground-muted">
                        Platform overview and analytics
                    </p>
                </div>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8 animate-fade-in pt-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Admin Dashboard
                    </h1>
                </div>
                <div className="glass-card p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
                    <p className="text-error font-medium">Failed to load dashboard data</p>
                    <p className="text-foreground-muted text-sm mt-2">{error}</p>
                </div>
            </div>
        );
    }

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
                            Live
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">RM {stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-foreground-muted">Total Revenue</p>
                </div>

                {/* Total Users */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-primary/20 text-primary">
                            +{stats.newUsersThisMonth} this month
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-sm text-foreground-muted">Total Users</p>
                </div>

                {/* Total Events */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-secondary/20 text-secondary">
                            {stats.activeEvents} active
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                    <p className="text-sm text-foreground-muted">Total Events</p>
                </div>

                {/* Invoices */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-warning" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-warning/20 text-warning">
                            {stats.pendingPayments} pending
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalInvoices}</p>
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
                        <Link href="/admin/revenue" className="text-primary text-sm hover:text-primary-hover">
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary/50">
                                    <div>
                                        <p className="font-medium text-white">{tx.user}</p>
                                        <p className="text-xs text-foreground-muted">{tx.id} • {formatDate(tx.date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white">RM {tx.amount?.toFixed(2) || '0.00'}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'paid'
                                            ? 'bg-success/20 text-success'
                                            : 'bg-warning/20 text-warning'
                                            }`}>
                                            {tx.status?.toUpperCase() || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-foreground-muted">
                                No transactions yet
                            </div>
                        )}
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
                        {topUsers.length > 0 ? (
                            topUsers.map((user, idx) => (
                                <div key={user.name + idx} className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-foreground-muted">{user.events} events</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-success">RM {user.revenue?.toFixed(2) || '0.00'}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-foreground-muted">
                                No user data yet
                            </div>
                        )}
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
                    <Link href="/admin/revenue" className="glass-card glass-card-hover p-4 text-center">
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
                    <Link href="/admin/tickets" className="glass-card glass-card-hover p-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center mx-auto mb-2">
                            <Activity className="w-6 h-6 text-warning" />
                        </div>
                        <p className="font-medium text-white">Tickets</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
