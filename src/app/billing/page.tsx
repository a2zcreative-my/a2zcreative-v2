"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { CreditCard, Building2, FileText, Check, Sparkles, Crown, Star, Gem, ArrowRight, Info, Eye, Loader2, Cake, Heart } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface PaymentRecord {
    id: string;
    event: string;
    plan: string;
    amount: number;
    date: string;
    status: string;
    method: string;
}

interface BillingSummary {
    totalEvents: number;
    totalSpent: number;
    lastPlan: string;
}

interface Plan {
    id: string;
    name: string;
    price: number | string;
    price_note?: string;
    tagline?: string;
    color: string;
    icon?: string;
    features: string[];
    popular?: boolean;
}

// Icon mapping
const planIconMap: Record<string, LucideIcon> = {
    starter: Cake,
    basic: Heart,
    premium: Gem,
    exclusive: Crown,
    Cake: Cake,
    Heart: Heart,
    Gem: Gem,
    Crown: Crown,
    Star: Star,
    Sparkles: Sparkles,
};

// Color mapping  
const planColorMap: Record<string, { color: string; bgColor: string; borderColor: string }> = {
    starter: { color: "text-starter", bgColor: "bg-starter/20", borderColor: "hover:border-starter/50" },
    basic: { color: "text-basic", bgColor: "bg-basic/20", borderColor: "hover:border-basic/50" },
    premium: { color: "text-premium", bgColor: "bg-premium/20", borderColor: "hover:border-premium" },
    exclusive: { color: "text-exclusive", bgColor: "bg-exclusive/20", borderColor: "hover:border-exclusive/50" },
};

// Default plans (fallback)
const defaultPlans: Plan[] = [
    {
        id: "starter",
        name: "Starter Pack",
        price: 20,
        color: "starter",
        features: ["1 page invitation", "Basic theme selection", "Event details display", "WhatsApp share link"],
    },
    {
        id: "basic",
        name: "Basic Pack",
        price: 49,
        color: "basic",
        popular: true,
        features: ["RSVP with guest count", "Google Maps integration", "Date countdown timer", "Theme customization"],
    },
    {
        id: "premium",
        name: "Premium Pack",
        price: 99,
        color: "premium",
        features: ["Custom domain/subdomain", "Photo & video gallery", "Advanced RSVP", "Analytics"],
    },
    {
        id: "exclusive",
        name: "Exclusive Plan",
        price: 199.99,
        color: "exclusive",
        features: ["Organizer dashboard", "QR check-in system", "Guest approval system", "Priority support"],
    },
];

export default function BillingPage() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [summary, setSummary] = useState<BillingSummary>({ totalEvents: 0, totalSpent: 0, lastPlan: 'None' });
    const [plans, setPlans] = useState<Plan[]>(defaultPlans);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch billing data
                const billingResponse = await fetch('/api/client/billing');
                if (billingResponse.ok) {
                    const data = await billingResponse.json();
                    setPayments(data.payments || []);
                    setSummary(data.summary || { totalEvents: 0, totalSpent: 0, lastPlan: 'None' });
                }

                // Fetch plans from database
                const plansResponse = await fetch('/api/plans');
                if (plansResponse.ok) {
                    const plansData = await plansResponse.json();
                    if (plansData.plans && plansData.plans.length > 0) {
                        setPlans(plansData.plans);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatPrice = (plan: Plan): string => {
        if (typeof plan.price === 'string') return plan.price;
        return `RM${plan.price}`;
    };

    const getColorClasses = (plan: Plan) => {
        return planColorMap[plan.color] || planColorMap[plan.id] || planColorMap.starter;
    };

    const getPlanIcon = (plan: Plan): LucideIcon => {
        return planIconMap[plan.icon || plan.id] || Cake;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Billing & Plans</h1>
                        <p className="text-foreground-muted">View your payment history and explore plans</p>
                    </div>
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Billing & Plans</h1>
                    <p className="text-foreground-muted">View your payment history and explore plans</p>
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
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === "history" ? "bg-primary text-white" : "bg-background-tertiary text-foreground-muted"
                            }`}
                    >
                        Payment History
                    </button>
                </div>

                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Account Summary */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Account Summary</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-background-tertiary rounded-xl">
                                    <p className="text-3xl font-bold text-white">{summary.totalEvents}</p>
                                    <p className="text-sm text-foreground-muted">Total Events</p>
                                </div>
                                <div className="text-center p-4 bg-background-tertiary rounded-xl">
                                    <p className="text-3xl font-bold text-success">RM {summary.totalSpent}</p>
                                    <p className="text-sm text-foreground-muted">Total Spent</p>
                                </div>
                                <div className="text-center p-4 bg-background-tertiary rounded-xl">
                                    <p className="text-3xl font-bold text-primary">{summary.lastPlan}</p>
                                    <p className="text-sm text-foreground-muted">Last Plan</p>
                                </div>
                            </div>
                        </div>

                        {/* Available Plans - Now Dynamic & Links to Create Event */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-semibold text-white">Available Plans</h2>
                                <div className="flex items-center gap-1 text-xs text-foreground-muted">
                                    <Info className="w-3 h-3" />
                                    Click to create event
                                </div>
                            </div>
                            <p className="text-sm text-foreground-muted mb-4">Select a plan to create your next event</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {plans.map((plan) => {
                                    const Icon = getPlanIcon(plan);
                                    const colors = getColorClasses(plan);
                                    return (
                                        <Link
                                            key={plan.id}
                                            href={`/events/create?plan=${plan.id}`}
                                            className={`p-4 rounded-xl border-2 transition-all relative group cursor-pointer ${plan.popular
                                                ? "border-primary bg-primary/10"
                                                : `border-[var(--glass-border)] bg-background-tertiary ${colors.borderColor}`
                                                }`}
                                        >
                                            {plan.popular && (
                                                <span className="absolute -top-2 right-4 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-10 h-10 rounded-xl ${colors.bgColor} flex items-center justify-center`}>
                                                    <Icon className={`w-5 h-5 ${colors.color}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white">{plan.name}</h3>
                                                    <p className="text-xs text-foreground-muted">{plan.tagline || 'Create your event'}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-foreground-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                            <p className={`text-2xl font-bold ${colors.color} mb-3`}>
                                                {formatPrice(plan)}
                                                <span className="text-xs text-foreground-muted font-normal"> /event</span>
                                            </p>
                                            <ul className="space-y-1">
                                                {plan.features.slice(0, 4).map((feature, idx) => (
                                                    <li key={idx} className="text-xs text-foreground-muted flex items-center gap-2">
                                                        <Check className={`w-3 h-3 ${colors.color}`} />
                                                        {feature}
                                                    </li>
                                                ))}
                                                {plan.features.length > 4 && (
                                                    <li className="text-xs text-foreground-muted">
                                                        +{plan.features.length - 4} more features
                                                    </li>
                                                )}
                                            </ul>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Payment Information</h2>
                            <div className="bg-background-tertiary rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium mb-1">Secure Payments via Billplz</p>
                                        <p className="text-sm text-foreground-muted">
                                            All payments are processed securely through Billplz. You can pay using:
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="text-xs bg-background px-2 py-1 rounded-lg text-foreground-muted">
                                                Credit/Debit Card
                                            </span>
                                            <span className="text-xs bg-background px-2 py-1 rounded-lg text-foreground-muted">
                                                FPX Online Banking
                                            </span>
                                            <span className="text-xs bg-background px-2 py-1 rounded-lg text-foreground-muted">
                                                e-Wallets
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Payment Methods Used - only show if there are payments */}
                            {payments.length > 0 && (
                                <>
                                    <h3 className="text-sm font-medium text-foreground-muted mt-6 mb-3">Recently Used</h3>
                                    <div className="space-y-2">
                                        {payments.slice(0, 2).map((payment) => (
                                            <div key={payment.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-tertiary">
                                                {payment.method?.includes('Card') ? (
                                                    <CreditCard className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <Building2 className="w-4 h-4 text-secondary" />
                                                )}
                                                <span className="text-sm text-white">{payment.method || 'Unknown'}</span>
                                                <span className="text-xs text-foreground-muted ml-auto">{payment.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="glass-card overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-[var(--glass-border)]">
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Event</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Plan</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Amount</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Method</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Date</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Status</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-foreground-muted">No payment history</td>
                                    </tr>
                                ) : payments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)]">
                                        <td className="p-4">
                                            <span className="text-white font-medium">{payment.event}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-foreground-muted">{payment.plan}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white font-semibold">RM {payment.amount}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-foreground-muted text-sm">{payment.method}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-foreground-muted">{payment.date}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                                                PAID
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                href={`/invoice/${payment.id}`}
                                                className="text-primary text-sm hover:text-primary-hover flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Invoice
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
