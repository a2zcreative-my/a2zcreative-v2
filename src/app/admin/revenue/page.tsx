"use client";

import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

// Mock revenue data
const revenueStats = [
    { label: "Total Revenue", value: "RM 45,230", change: "+18%", isPositive: true, icon: DollarSign, color: "success", bgColor: "bg-success/20" },
    { label: "This Month", value: "RM 8,450", change: "+12%", isPositive: true, icon: TrendingUp, color: "primary", bgColor: "bg-primary/20" },
    { label: "Pending Payouts", value: "RM 2,100", change: "-5%", isPositive: false, icon: CreditCard, color: "warning", bgColor: "bg-warning/20" },
];

const recentTransactions = [
    { id: "TXN001", user: "Ahmad bin Hassan", email: "ahmad@example.com", plan: "Premium", amount: "RM 150", date: "2026-01-18", status: "completed" },
    { id: "TXN002", user: "Fatimah Lee", email: "fatimah@example.com", plan: "Basic", amount: "RM 99", date: "2026-01-17", status: "completed" },
    { id: "TXN003", user: "TechCorp Sdn Bhd", email: "hr@techcorp.com", plan: "Exclusive", amount: "RM 500", date: "2026-01-16", status: "completed" },
    { id: "TXN004", user: "Zainab Abdullah", email: "zainab@example.com", plan: "Premium", amount: "RM 150", date: "2026-01-15", status: "refunded" },
    { id: "TXN005", user: "Mohammad Ali", email: "ali@example.com", plan: "Premium", amount: "RM 150", date: "2026-01-14", status: "completed" },
];

const monthlyRevenue = [
    { month: "Aug", revenue: 3200 },
    { month: "Sep", revenue: 4100 },
    { month: "Oct", revenue: 5800 },
    { month: "Nov", revenue: 6200 },
    { month: "Dec", revenue: 7500 },
    { month: "Jan", revenue: 8450 },
];

const planBreakdown = [
    { plan: "Basic", count: 89, revenue: "RM 8,811", percentage: 19 },
    { plan: "Premium", count: 124, revenue: "RM 18,600", percentage: 41 },
    { plan: "Exclusive", count: 36, revenue: "RM 18,000", percentage: 40 },
];

export default function AdminRevenuePage() {
    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Revenue
                </h1>
                <p className="text-foreground-muted">
                    Track platform revenue and transactions
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {revenueStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 text-${stat.color}`} strokeWidth={1.5} />
                                </div>
                                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${stat.isPositive ? "bg-success/20 text-success" : "bg-error/20 text-error"
                                    }`}>
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-foreground-muted">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Monthly Revenue
                    </h3>
                    <div className="flex items-end gap-2 h-48">
                        {monthlyRevenue.map((month) => (
                            <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all duration-500"
                                    style={{ height: `${(month.revenue / maxRevenue) * 100}%` }}
                                />
                                <span className="text-xs text-foreground-muted">{month.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Breakdown */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-secondary" />
                        Revenue by Plan
                    </h3>
                    <div className="space-y-4">
                        {planBreakdown.map((plan) => (
                            <div key={plan.plan}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium">{plan.plan}</span>
                                    <span className="text-foreground-muted text-sm">{plan.revenue} ({plan.count} users)</span>
                                </div>
                                <div className="h-3 bg-background-tertiary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${plan.plan === "Basic" ? "bg-info" :
                                            plan.plan === "Premium" ? "bg-primary" : "bg-secondary"
                                            }`}
                                        style={{ width: `${plan.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-[var(--glass-border)]">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        Recent Transactions
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--glass-border)]">
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Transaction ID</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">User</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Plan</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Amount</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Date</th>
                                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.map((txn) => (
                                <tr key={txn.id} className="border-b border-[var(--glass-border)] hover:bg-white/5">
                                    <td className="p-4 text-white font-mono text-sm">{txn.id}</td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-white">{txn.user}</p>
                                            <p className="text-sm text-foreground-muted">{txn.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge-${txn.plan.toLowerCase()} text-xs font-bold px-2 py-1 rounded-full text-white`}>
                                            {txn.plan.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-semibold">{txn.amount}</td>
                                    <td className="p-4 text-foreground-muted">{txn.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${txn.status === "completed"
                                            ? "bg-success/20 text-success"
                                            : "bg-warning/20 text-warning"
                                            }`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
