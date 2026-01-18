"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    Clock,
    FileText,
    Eye,
    Loader2,
    AlertTriangle,
    Star,
    Sparkles,
    Crown,
    Gem,
} from "lucide-react";

interface Invoice {
    id: string;
    user: string;
    event: string;
    plan: string;
    amount: number;
    date: string;
    status: string;
    method: string;
}

interface BillingSummary {
    totalRevenue: number;
    pendingRevenue: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
}

interface PlanBreakdown {
    name: string;
    count: number;
    revenue: number;
}

const planIcons: Record<string, typeof Star> = {
    Starter: Star,
    Basic: Sparkles,
    Premium: Crown,
    Exclusive: Gem,
};

const planColors: Record<string, { bg: string; text: string }> = {
    Starter: { bg: "bg-blue-400/20", text: "text-blue-400" },
    Basic: { bg: "bg-green-400/20", text: "text-green-400" },
    Premium: { bg: "bg-primary/20", text: "text-primary" },
    Exclusive: { bg: "bg-purple-400/20", text: "text-purple-400" },
};

export default function AdminBillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [summary, setSummary] = useState<BillingSummary>({
        totalRevenue: 0,
        pendingRevenue: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0
    });
    const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "all">("overview");

    useEffect(() => {
        async function fetchBillingData() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/admin/billing');

                if (!response.ok) {
                    throw new Error('Failed to fetch billing data');
                }

                const data = await response.json();
                setInvoices(data.invoices || []);
                setSummary(data.summary || {
                    totalRevenue: 0,
                    pendingRevenue: 0,
                    totalInvoices: 0,
                    paidInvoices: 0,
                    pendingInvoices: 0
                });
                setPlanBreakdown(data.planBreakdown || []);
            } catch (err) {
                setError(String(err));
            } finally {
                setLoading(false);
            }
        }
        fetchBillingData();
    }, []);

    // Format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in pt-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Platform Billing
                    </h1>
                    <p className="text-foreground-muted">
                        Revenue overview and payment management
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
            <div className="space-y-6 animate-fade-in pt-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Platform Billing
                    </h1>
                </div>
                <div className="glass-card p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
                    <p className="text-error font-medium">Failed to load billing data</p>
                    <p className="text-foreground-muted text-sm mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pt-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Platform Billing
                </h1>
                <p className="text-foreground-muted">
                    Revenue overview and payment management
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-success" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-success/20 text-success">
                            Live
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">RM {summary.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-foreground-muted">Total Revenue</p>
                </div>

                {/* Pending Revenue */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-warning" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-warning/20 text-warning">
                            Pending
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">RM {summary.pendingRevenue.toLocaleString()}</p>
                    <p className="text-sm text-foreground-muted">Pending Payments</p>
                </div>

                {/* Total Invoices */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{summary.totalInvoices}</p>
                    <p className="text-sm text-foreground-muted">Total Invoices</p>
                </div>

                {/* Paid Rate */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-secondary" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {summary.totalInvoices > 0
                            ? Math.round((summary.paidInvoices / summary.totalInvoices) * 100)
                            : 0}%
                    </p>
                    <p className="text-sm text-foreground-muted">Payment Success Rate</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === "overview" ? "bg-primary text-white" : "bg-background-tertiary text-foreground-muted"
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === "all" ? "bg-primary text-white" : "bg-background-tertiary text-foreground-muted"
                        }`}
                >
                    All Invoices
                </button>
            </div>

            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Plan Breakdown */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Revenue by Plan
                        </h2>
                        <div className="space-y-3">
                            {planBreakdown.length > 0 ? (
                                planBreakdown.map((plan) => {
                                    const Icon = planIcons[plan.name] || Star;
                                    const colors = planColors[plan.name] || { bg: "bg-gray-400/20", text: "text-gray-400" };
                                    return (
                                        <div key={plan.name} className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                                    <Icon className={`w-5 h-5 ${colors.text}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{plan.name}</p>
                                                    <p className="text-xs text-foreground-muted">{plan.count} invoices</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-success">RM {plan.revenue.toLocaleString()}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-foreground-muted">
                                    No plan data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Paid Invoices */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-success" />
                                Recent Payments
                            </h2>
                            <button
                                onClick={() => setActiveTab("all")}
                                className="text-primary text-sm hover:text-primary-hover"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {invoices.filter(i => i.status === 'paid').slice(0, 5).map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
                                    <div>
                                        <p className="font-medium text-white">{invoice.user}</p>
                                        <p className="text-xs text-foreground-muted">{invoice.plan} • {formatDate(invoice.date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white">RM {invoice.amount.toFixed(2)}</p>
                                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                                            PAID
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {invoices.filter(i => i.status === 'paid').length === 0 && (
                                <div className="text-center py-8 text-foreground-muted">
                                    No payments yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "all" && (
                <div className="glass-card overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-[var(--glass-border)]">
                                <th className="p-4 text-left text-sm font-medium text-foreground-muted">Invoice ID</th>
                                <th className="p-4 text-left text-sm font-medium text-foreground-muted">User</th>
                                <th className="p-4 text-left text-sm font-medium text-foreground-muted">Event</th>
                                <th className="p-4 text-left text-sm font-medium text-foreground-muted">Plan</th>
                                <th className="p-4 text-left text-sm font-medium text-foreground-muted">Amount</th>
                                <th className="p-4 text-left text-sm font-medium text-foreground-muted">Date</th>
                                <th className="p-4 text-left text-sm font-medium text-foreground-muted">Status</th>
                                <th className="p-4 text-left text-sm font-medium text-foreground-muted">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-foreground-muted">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)]">
                                    <td className="p-4">
                                        <span className="text-white font-mono text-sm">{invoice.id.slice(0, 8)}...</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-white">{invoice.user}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-foreground-muted">{invoice.event}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-foreground-muted">{invoice.plan}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-white font-semibold">RM {invoice.amount.toFixed(2)}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-foreground-muted">{formatDate(invoice.date)}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${invoice.status === 'paid'
                                            ? 'bg-success/20 text-success'
                                            : 'bg-warning/20 text-warning'
                                            }`}>
                                            {invoice.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Link
                                            href={`/invoice/${invoice.id}`}
                                            className="text-primary text-sm hover:text-primary-hover flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
