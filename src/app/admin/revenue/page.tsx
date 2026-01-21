"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    ArrowUpRight,
    Loader2,
    AlertTriangle,
    RotateCcw,
    X,
    History,
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

interface Refund {
    id: string;
    invoice_id: string;
    admin_name: string | null;
    amount: number;
    reason: string | null;
    created_at: string;
    customer_name: string | null;
}

export default function AdminRevenuePage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({ totalRevenue: 0, thisMonth: 0, pending: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown[]>([]);

    // Refund state
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundReason, setRefundReason] = useState("");
    const [refundLoading, setRefundLoading] = useState(false);
    const [showRefundsHistory, setShowRefundsHistory] = useState(false);

    const fetchRefunds = async () => {
        try {
            const response = await fetch('/api/admin/refunds');
            if (response.ok) {
                const data = await response.json();
                setRefunds(data.refunds || []);
            }
        } catch (err) {
            console.error('Failed to fetch refunds:', err);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/admin/revenue');
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error(data.error || 'Unauthorized');
                }
                console.error('API error:', data.error);
            }

            setStats(data.stats || { totalRevenue: 0, thisMonth: 0, pending: 0 });
            setTransactions(data.transactions || []);
            setPlanBreakdown(data.planBreakdown || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setStats({ totalRevenue: 0, thisMonth: 0, pending: 0 });
            setTransactions([]);
            setPlanBreakdown([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchRefunds();
    }, []);

    const openRefundModal = (tx: Transaction) => {
        setSelectedInvoice(tx);
        setRefundAmount(tx.amount?.toString() || "");
        setRefundReason("");
        setShowRefundModal(true);
    };

    const handleRefund = async () => {
        if (!selectedInvoice) return;

        const amount = parseFloat(refundAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid refund amount");
            return;
        }

        if (amount > (selectedInvoice.amount || 0)) {
            alert("Refund amount cannot exceed invoice amount");
            return;
        }

        if (!confirm(`Process refund of RM ${amount.toFixed(2)} for invoice #${selectedInvoice.id.slice(0, 8).toUpperCase()}?`)) {
            return;
        }

        setRefundLoading(true);
        try {
            const response = await fetch('/api/admin/refunds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice_id: selectedInvoice.id,
                    amount,
                    reason: refundReason || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✓ ${data.message}`);
                setShowRefundModal(false);
                setSelectedInvoice(null);
                await fetchTransactions();
                await fetchRefunds();
            } else {
                alert(data.error || 'Failed to process refund');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to process refund');
        } finally {
            setRefundLoading(false);
        }
    };

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
                                        <th className="text-left py-3 text-sm font-medium text-foreground-muted">Action</th>
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
                                                    : tx.status === 'refunded' || tx.status === 'partial_refund'
                                                        ? 'bg-error/20 text-error'
                                                        : 'bg-warning/20 text-warning'
                                                    }`}>
                                                    {tx.status?.toUpperCase() || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                {(tx.status === 'paid' || tx.status === 'completed') && (
                                                    <button
                                                        onClick={() => openRefundModal(tx)}
                                                        className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"
                                                        title="Process Refund"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                )}
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

            {/* Refund History Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowRefundsHistory(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-background-tertiary/50 border border-[var(--glass-border)] text-foreground-muted hover:text-white rounded-xl transition-colors"
                >
                    <History className="w-4 h-4" />
                    View Refund History ({refunds.length})
                </button>
            </div>

            {/* Refund Modal */}
            {showRefundModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background-secondary border border-[var(--glass-border)] rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-error" />
                                Process Refund
                            </h3>
                            <button
                                onClick={() => setShowRefundModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-foreground-muted" />
                            </button>
                        </div>

                        <div className="p-4 bg-background-tertiary/50 rounded-xl mb-4">
                            <p className="text-sm text-foreground-muted mb-1">Invoice</p>
                            <p className="text-white font-medium">#{selectedInvoice.id.slice(0, 8).toUpperCase()}</p>
                            <div className="flex justify-between mt-2">
                                <span className="text-sm text-foreground-muted">Customer:</span>
                                <span className="text-sm text-white">{selectedInvoice.user}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-foreground-muted">Original Amount:</span>
                                <span className="text-sm text-white">RM {selectedInvoice.amount?.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-1">
                                    Refund Amount (RM)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={selectedInvoice.amount || 0}
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-1">
                                    Reason (Optional)
                                </label>
                                <select
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="Customer request">Customer request</option>
                                    <option value="Service issue">Service issue</option>
                                    <option value="Duplicate payment">Duplicate payment</option>
                                    <option value="Cancelled event">Cancelled event</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    onClick={() => setShowRefundModal(false)}
                                    className="px-4 py-2 text-foreground-muted hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRefund}
                                    disabled={refundLoading || !refundAmount}
                                    className="flex items-center gap-2 px-6 py-2 bg-error text-white rounded-xl hover:bg-error/90 transition-colors disabled:opacity-50"
                                >
                                    {refundLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RotateCcw className="w-4 h-4" />
                                    )}
                                    Process Refund
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund History Modal */}
            {showRefundsHistory && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background-secondary border border-[var(--glass-border)] rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-secondary" />
                                Refund History
                            </h3>
                            <button
                                onClick={() => setShowRefundsHistory(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-foreground-muted" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {refunds.length === 0 ? (
                                <div className="text-center py-12 text-foreground-muted">
                                    <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No refunds processed yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {refunds.map((refund) => (
                                        <div key={refund.id} className="p-4 bg-background-tertiary/50 rounded-xl">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-medium text-white">
                                                        Invoice #{refund.invoice_id.slice(0, 8).toUpperCase()}
                                                    </p>
                                                    <p className="text-sm text-foreground-muted">
                                                        {refund.customer_name || 'Unknown customer'}
                                                    </p>
                                                </div>
                                                <span className="text-error font-semibold">
                                                    -RM {refund.amount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-foreground-muted">
                                                <span>
                                                    {refund.reason || 'No reason provided'}
                                                </span>
                                                <span>{formatDate(refund.created_at)}</span>
                                            </div>
                                            <p className="text-xs text-foreground-muted mt-1">
                                                Processed by: {refund.admin_name || 'Admin'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
