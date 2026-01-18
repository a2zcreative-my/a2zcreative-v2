"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    ArrowUpRight,
    Loader2,
    AlertTriangle,
} from "lucide-react";

interface Stats {
    totalRevenue: number;
    thisMonth: number;
    pending: number;
}

interface Transaction {
    id: string;
    user: string;
    email: string;
    plan: string;
    amount: number;
    date: string;
    status: string;
}

interface PlanBreakdown {
    plan: string;
    count: number;
    revenue: number;
    percentage: number;
}

export default function AdminRevenuePage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({ totalRevenue: 0, thisMonth: 0, pending: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/revenue');
                if (!response.ok) throw new Error('Failed to fetch revenue data');
                const data = await response.json();
                setStats(data.stats);
                setTransactions(data.transactions || []);
                setPlanBreakdown(data.planBreakdown || []);
            } catch (err) {
                setError(String(err));
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const revenueStats = [
        { label: "Total Revenue", value: `RM ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "success", bgColor: "bg-success/20" },
        { label: "This Month", value: `RM ${stats.thisMonth.toLocaleString()}`, icon: TrendingUp, color: "primary", bgColor: "bg-primary/20" },
        { label: "Pending Payouts", value: `RM ${stats.pending.toLocaleString()}`, icon: CreditCard, color: "warning", bgColor: "bg-warning/20" },
    ];

    if (loading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Revenue</h1>
                    <p className="text-foreground-muted">Platform revenue overview and transactions</p>
                </div>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Revenue</h1>
                </div>
                <div className="glass-card p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
                    <p className="text-error font-medium">Failed to load revenue data</p>
                    <p className="text-foreground-muted text-sm mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Revenue
                </h1>
                <p className="text-foreground-muted">
                    Platform revenue overview and transactions
                </p>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {revenueStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 text-${stat.color}`} strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-lg bg-success/20 text-success flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" />
                                    Live
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-foreground-muted">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Recent Transactions
                    </h2>
                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--glass-border)]">
                                        <th className="text-left py-3 text-sm font-medium text-foreground-muted">User</th>
                                        <th className="text-left py-3 text-sm font-medium text-foreground-muted">Plan</th>
                                        <th className="text-left py-3 text-sm font-medium text-foreground-muted">Amount</th>
                                        <th className="text-left py-3 text-sm font-medium text-foreground-muted">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 10).map((tx) => (
                                        <tr key={tx.id} className="border-b border-[var(--glass-border)]/50">
                                            <td className="py-3">
                                                <p className="text-white font-medium">{tx.user}</p>
                                                <p className="text-xs text-foreground-muted">{formatDate(tx.date)}</p>
                                            </td>
                                            <td className="py-3">
                                                <span className="text-sm text-white">{tx.plan}</span>
                                            </td>
                                            <td className="py-3 text-white font-medium">RM {tx.amount?.toFixed(2) || '0.00'}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${tx.status === 'paid' || tx.status === 'completed'
                                                        ? 'bg-success/20 text-success'
                                                        : tx.status === 'refunded'
                                                            ? 'bg-error/20 text-error'
                                                            : 'bg-warning/20 text-warning'
                                                    }`}>
                                                    {tx.status?.toUpperCase() || 'PENDING'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-foreground-muted">
                            No transactions yet
                        </div>
                    )}
                </div>

                {/* Plan Breakdown */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        Revenue by Plan
                    </h2>
                    {planBreakdown.length > 0 ? (
                        <div className="space-y-4">
                            {planBreakdown.map((plan) => (
                                <div key={plan.plan}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="text-white font-medium">{plan.plan}</span>
                                            <span className="text-foreground-muted text-sm ml-2">({plan.count} invoices)</span>
                                        </div>
                                        <span className="text-success font-semibold">RM {plan.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                            style={{ width: `${plan.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-right text-xs text-foreground-muted mt-1">{plan.percentage}%</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-foreground-muted">
                            No revenue data yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
