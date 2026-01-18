"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Shield,
    Server,
    Database,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    CreditCard,
    Star,
    Sparkles,
    Crown,
    Gem,
    ExternalLink,
} from "lucide-react";

interface PlatformStats {
    totalUsers: number;
    totalEvents: number;
    totalInvoices: number;
}

const plans = [
    {
        id: "starter",
        name: "Starter Pack",
        price: "RM20",
        icon: Star,
        color: "text-blue-400",
        bgColor: "bg-blue-400/20",
        features: ["1 Event", "Up to 50 Guests", "Basic Invitation Design", "RSVP Tracking"],
    },
    {
        id: "basic",
        name: "Basic Pack",
        price: "RM49",
        icon: Sparkles,
        color: "text-green-400",
        bgColor: "bg-green-400/20",
        features: ["1 Event", "Up to 150 Guests", "5 Design Templates", "RSVP + Check-in", "QR Code Invites"],
    },
    {
        id: "premium",
        name: "Premium Pack",
        price: "RM99",
        icon: Crown,
        color: "text-primary",
        bgColor: "bg-primary/20",
        features: ["1 Event", "Up to 500 Guests", "All Design Templates", "Priority Support", "Custom Branding", "Analytics Dashboard"],
    },
    {
        id: "exclusive",
        name: "Exclusive Plan",
        price: "RM199.99",
        icon: Gem,
        color: "text-purple-400",
        bgColor: "bg-purple-400/20",
        features: ["Unlimited Events", "Unlimited Guests", "All Premium Features", "Dedicated Support", "White-label Option", "API Access"],
    },
];

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalEvents: 0, totalInvoices: 0 });
    const [activeTab, setActiveTab] = useState<"overview" | "plans" | "integrations">("overview");

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats({
                        totalUsers: data.stats?.totalUsers || 0,
                        totalEvents: data.stats?.totalEvents || 0,
                        totalInvoices: data.stats?.totalInvoices || 0,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in pt-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Platform Settings
                    </h1>
                    <p className="text-foreground-muted">
                        Configure platform settings and integrations
                    </p>
                </div>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pt-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Platform Settings
                </h1>
                <p className="text-foreground-muted">
                    Configure platform settings and integrations
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {(["overview", "plans", "integrations"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl font-medium capitalize transition-all ${activeTab === tab ? "bg-primary text-white" : "bg-background-tertiary text-foreground-muted"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* System Status */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" />
                            System Status
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-background-tertiary">
                                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">API Status</p>
                                    <p className="text-sm text-success">Operational</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-background-tertiary">
                                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                    <Database className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Database</p>
                                    <p className="text-sm text-success">Connected (D1)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-background-tertiary">
                                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Auth</p>
                                    <p className="text-sm text-success">Supabase Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Platform Stats */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Platform Overview
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-xl bg-background-tertiary">
                                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                                <p className="text-sm text-foreground-muted">Total Users</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-background-tertiary">
                                <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
                                <p className="text-sm text-foreground-muted">Total Events</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-background-tertiary">
                                <p className="text-3xl font-bold text-white">{stats.totalInvoices}</p>
                                <p className="text-sm text-foreground-muted">Total Invoices</p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Info */}
                    <div className="glass-card p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Admin Access</h3>
                                <p className="text-sm text-foreground-muted">
                                    You have full administrative access to the platform. All changes made here will affect the entire system.
                                    Please exercise caution when modifying platform settings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans Tab */}
            {activeTab === "plans" && (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Available Plans
                        </h2>
                        <p className="text-sm text-foreground-muted mb-4">
                            Current pricing structure for event packages
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plans.map((plan) => {
                                const Icon = plan.icon;
                                return (
                                    <div
                                        key={plan.id}
                                        className="p-4 rounded-xl border border-[var(--glass-border)] bg-background-tertiary"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                                                <Icon className={`w-5 h-5 ${plan.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{plan.name}</h3>
                                                <p className={`text-lg font-bold ${plan.color}`}>{plan.price}</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-1">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="text-xs text-foreground-muted flex items-center gap-2">
                                                    <CheckCircle2 className={`w-3 h-3 ${plan.color}`} />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Active Integrations</h2>
                        <div className="space-y-3">
                            {[
                                { name: "Supabase Auth", status: "connected", description: "User authentication and management" },
                                { name: "Cloudflare D1", status: "connected", description: "Database storage" },
                                { name: "Cloudflare R2", status: "connected", description: "File storage" },
                                { name: "Billplz", status: "connected", description: "Payment processing" },
                                { name: "Resend", status: "connected", description: "Email delivery" },
                            ].map((integration) => (
                                <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-success" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{integration.name}</p>
                                            <p className="text-xs text-foreground-muted">{integration.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                                        {integration.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">External Links</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { name: "Cloudflare Dashboard", url: "https://dash.cloudflare.com/" },
                                { name: "Supabase Dashboard", url: "https://supabase.com/dashboard" },
                                { name: "Billplz Dashboard", url: "https://www.billplz.com/enterprise/login" },
                                { name: "Resend Dashboard", url: "https://resend.com/overview" },
                            ].map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary hover:border-primary/30 border border-transparent transition-all"
                                >
                                    <span className="text-white">{link.name}</span>
                                    <ExternalLink className="w-4 h-4 text-foreground-muted" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
