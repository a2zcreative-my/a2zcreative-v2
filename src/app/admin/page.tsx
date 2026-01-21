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
    BarChart3,
    PieChart,
    Percent,
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

interface AnalyticsData {
    revenueTrend: { date: string; revenue: number }[];
    userGrowth: { date: string; users: number }[];
    eventTypes: { type: string; count: number }[];
    metrics: {
        conversionRate: number;
        avgRevenuePerUser: number;
    };
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
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

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

        // Fetch analytics data
        async function fetchAnalytics() {
            try {
                const response = await fetch('/api/admin/analytics');
                if (response.ok) {
                    const data = await response.json();
                    setAnalytics(data);
                }
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            }
        }
        fetchAnalytics();
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

            {/* Analytics Charts Section */}
            {analytics && (
                <div className="space-y-6">
                    {/* Additional Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Percent className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{analytics.metrics.conversionRate}%</p>
                                    <p className="text-sm text-foreground-muted">Conversion Rate</p>
                                </div>
                            </div>
                            <p className="text-xs text-foreground-muted">Users with at least one paid invoice</p>
                        </div>
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">RM {analytics.metrics.avgRevenuePerUser}</p>
                                    <p className="text-sm text-foreground-muted">Avg Revenue Per User</p>
                                </div>
                            </div>
                            <p className="text-xs text-foreground-muted">Average across paying customers</p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Trend Chart */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-success" />
                                Revenue Trend (Last 30 Days)
                            </h2>
                            <div className="h-40 flex items-end gap-1">
                                {analytics.revenueTrend.length > 0 ? (
                                    analytics.revenueTrend.map((day, idx) => {
                                        const maxRevenue = Math.max(...analytics.revenueTrend.map(d => d.revenue));
                                        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex-1 bg-gradient-to-t from-success/50 to-success rounded-t-sm hover:from-success/70 hover:to-success transition-all cursor-pointer group relative"
                                                style={{ height: `${Math.max(height, 4)}%` }}
                                                title={`${day.date}: RM ${day.revenue}`}
                                            >
                                                <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-background-secondary text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                    RM {day.revenue}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-foreground-muted text-sm">
                                        No revenue data yet
                                    </div>
                                )}
                            </div>
                            {analytics.revenueTrend.length > 0 && (
                                <p className="text-xs text-foreground-muted mt-2 text-center">
                                    Hover over bars to see daily revenue
                                </p>
                            )}
                        </div>

                        {/* Event Type Distribution */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-secondary" />
                                Event Type Distribution
                            </h2>
                            <div className="space-y-3">
                                {analytics.eventTypes.length > 0 ? (
                                    analytics.eventTypes.map((type, idx) => {
                                        const colors = ['bg-primary', 'bg-secondary', 'bg-success', 'bg-warning', 'bg-error', 'bg-purple-500'];
                                        const totalEvents = analytics.eventTypes.reduce((sum, t) => sum + t.count, 0);
                                        const percentage = totalEvents > 0 ? (type.count / totalEvents * 100).toFixed(1) : 0;
                                        return (
                                            <div key={type.type} className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm text-white">{type.type}</span>
                                                        <span className="text-xs text-foreground-muted">{type.count} ({percentage}%)</span>
                                                    </div>
                                                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${colors[idx % colors.length]} rounded-full transition-all`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-foreground-muted text-sm">
                                        No event data yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
