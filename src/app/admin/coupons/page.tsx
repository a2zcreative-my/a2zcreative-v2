"use client";

import { useState, useEffect } from "react";
import {
    Ticket,
    Plus,
    Search,
    Loader2,
    AlertTriangle,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Percent,
    DollarSign,
    X,
    Calendar,
} from "lucide-react";

interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    applicable_plans: string | null;
    max_uses: number | null;
    used_count: number;
    valid_from: string | null;
    valid_until: string | null;
    active: number;
    created_at: string;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // New coupon form state
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: 10,
        applicable_plans: [] as string[],
        max_uses: "",
        valid_from: "",
        valid_until: "",
    });

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/coupons");
            if (!response.ok) throw new Error("Failed to fetch coupons");
            const data = await response.json();
            setCoupons(data.coupons || []);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreateCoupon = async () => {
        if (!newCoupon.code || !newCoupon.discount_value) {
            alert("Code and discount value are required");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newCoupon,
                    max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
                    applicable_plans: newCoupon.applicable_plans.length > 0 ? newCoupon.applicable_plans : null,
                }),
            });

            if (response.ok) {
                setShowModal(false);
                setNewCoupon({
                    code: "",
                    discount_type: "percentage",
                    discount_value: 10,
                    applicable_plans: [],
                    max_uses: "",
                    valid_from: "",
                    valid_until: "",
                });
                fetchCoupons();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to create coupon");
            }
        } catch (err) {
            alert("Failed to create coupon");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (coupon: Coupon) => {
        setActionLoading(coupon.id);
        try {
            const response = await fetch("/api/admin/coupons", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
            });

            if (response.ok) {
                setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, active: coupon.active ? 0 : 1 } : c));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (coupon: Coupon) => {
        if (!confirm(`Delete coupon "${coupon.code}"?`)) return;

        setActionLoading(coupon.id);
        try {
            const response = await fetch(`/api/admin/coupons?id=${coupon.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setCoupons(coupons.filter(c => c.id !== coupon.id));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: "Total Coupons", value: coupons.length, icon: Ticket, color: "primary" },
        { label: "Active", value: coupons.filter(c => c.active).length, icon: ToggleRight, color: "success" },
        { label: "Used", value: coupons.reduce((sum, c) => sum + c.used_count, 0), icon: DollarSign, color: "secondary" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Coupons</h1>
                    <p className="text-foreground-muted">Manage promo codes and discounts</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Coupon
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-xl bg-${stat.color}/20 flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 text-${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-foreground-muted">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                    type="text"
                    placeholder="Search coupons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
                />
            </div>

            {/* Loading */}
            {loading && (
                <div className="glass-card p-8 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-foreground-muted">Loading coupons...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass-card p-8 text-center">
                    <AlertTriangle className="w-8 h-8 text-error mx-auto mb-2" />
                    <p className="text-error">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && coupons.length === 0 && (
                <div className="glass-card p-8 text-center">
                    <Ticket className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Coupons Yet</h3>
                    <p className="text-foreground-muted mb-4">Create your first coupon to offer discounts</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        Create Coupon
                    </button>
                </div>
            )}

            {/* Coupons List */}
            {!loading && !error && filteredCoupons.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-[var(--glass-border)]">
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Code</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Discount</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Usage</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Validity</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="border-b border-[var(--glass-border)] hover:bg-white/5">
                                        <td className="p-4">
                                            <span className="font-mono font-bold text-white bg-primary/20 px-3 py-1 rounded-lg">
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {coupon.discount_type === "percentage" ? (
                                                    <Percent className="w-4 h-4 text-success" />
                                                ) : (
                                                    <DollarSign className="w-4 h-4 text-success" />
                                                )}
                                                <span className="text-white">
                                                    {coupon.discount_type === "percentage"
                                                        ? `${coupon.discount_value}%`
                                                        : `RM${coupon.discount_value}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-foreground-muted">
                                            {coupon.used_count} / {coupon.max_uses || "∞"}
                                        </td>
                                        <td className="p-4 text-foreground-muted text-sm">
                                            {coupon.valid_from || coupon.valid_until ? (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : "Any"} -{" "}
                                                    {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : "Any"}
                                                </div>
                                            ) : (
                                                "No expiry"
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${coupon.active
                                                    ? "bg-success/20 text-success"
                                                    : "bg-foreground-muted/20 text-foreground-muted"
                                                }`}>
                                                {coupon.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(coupon)}
                                                    disabled={actionLoading === coupon.id}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors"
                                                    title={coupon.active ? "Deactivate" : "Activate"}
                                                >
                                                    {actionLoading === coupon.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : coupon.active ? (
                                                        <ToggleRight className="w-4 h-4 text-success" />
                                                    ) : (
                                                        <ToggleLeft className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon)}
                                                    disabled={actionLoading === coupon.id}
                                                    className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Coupon Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Create Coupon</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Coupon Code *</label>
                                <input
                                    type="text"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., WELCOME20"
                                    className="input-field w-full font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Discount Type</label>
                                    <select
                                        value={newCoupon.discount_type}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                                        className="input-field w-full"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed (RM)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Discount Value *</label>
                                    <input
                                        type="number"
                                        value={newCoupon.discount_value}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseFloat(e.target.value) || 0 })}
                                        className="input-field w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Max Uses (leave empty for unlimited)</label>
                                <input
                                    type="number"
                                    value={newCoupon.max_uses}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                                    placeholder="Unlimited"
                                    className="input-field w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Valid From</label>
                                    <input
                                        type="date"
                                        value={newCoupon.valid_from}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, valid_from: e.target.value })}
                                        className="input-field w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Valid Until</label>
                                    <input
                                        type="date"
                                        value={newCoupon.valid_until}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
                                        className="input-field w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateCoupon}
                                    disabled={saving}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? "Creating..." : "Create Coupon"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
