"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { CreditCard, Building2, FileText, Check, Sparkles, Crown, Star, Gem, ArrowRight, Info, Eye } from "lucide-react";

interface PaymentRecord {
    id: string;
    event: string;
    plan: string;
    amount: number;
    date: string;
    status: string;
    method: string;
}

const paymentHistory: PaymentRecord[] = [
    { id: "1", event: "Majlis Perkahwinan Ahmad & Alia", plan: "Premium", amount: 134, date: "15 Jan 2026", status: "paid", method: "Card •••• 4242" },
    { id: "2", event: "Birthday Bash - Aiman", plan: "Basic", amount: 49, date: "10 Jan 2026", status: "paid", method: "FPX Maybank" },
    { id: "3", event: "Aqiqah Baby Arya", plan: "Starter", amount: 20, date: "1 Dec 2025", status: "paid", method: "FPX CIMB" },
];

const plans = [
    {
        id: "starter",
        name: "Starter Pack",
        price: "RM20",
        icon: Star,
        color: "text-blue-400",
        bgColor: "bg-blue-400/20",
        borderColor: "hover:border-blue-400/50",
        features: ["1 Event", "Up to 50 Guests", "Basic Invitation Design", "RSVP Tracking"],
        description: "Perfect for small gatherings"
    },
    {
        id: "basic",
        name: "Basic Pack",
        price: "RM49",
        icon: Sparkles,
        color: "text-green-400",
        bgColor: "bg-green-400/20",
        borderColor: "hover:border-green-400/50",
        features: ["1 Event", "Up to 150 Guests", "5 Design Templates", "RSVP + Check-in", "QR Code Invites"],
        description: "Great for medium events"
    },
    {
        id: "premium",
        name: "Premium Pack",
        price: "RM99",
        icon: Crown,
        color: "text-primary",
        bgColor: "bg-primary/20",
        borderColor: "hover:border-primary",
        features: ["1 Event", "Up to 500 Guests", "All Design Templates", "Priority Support", "Custom Branding", "Analytics Dashboard"],
        description: "Best for large celebrations",
        popular: true
    },
    {
        id: "exclusive",
        name: "Exclusive Plan",
        price: "RM199.99",
        icon: Gem,
        color: "text-purple-400",
        bgColor: "bg-purple-400/20",
        borderColor: "hover:border-purple-400/50",
        features: ["Unlimited Events", "Unlimited Guests", "All Premium Features", "Dedicated Support", "White-label Option", "API Access"],
        description: "For event professionals"
    },
];

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

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
                                    <p className="text-3xl font-bold text-white">4</p>
                                    <p className="text-sm text-foreground-muted">Total Events</p>
                                </div>
                                <div className="text-center p-4 bg-background-tertiary rounded-xl">
                                    <p className="text-3xl font-bold text-success">RM 203</p>
                                    <p className="text-sm text-foreground-muted">Total Spent</p>
                                </div>
                                <div className="text-center p-4 bg-background-tertiary rounded-xl">
                                    <p className="text-3xl font-bold text-primary">Premium</p>
                                    <p className="text-sm text-foreground-muted">Last Plan</p>
                                </div>
                            </div>
                        </div>

                        {/* Available Plans - Now Clickable */}
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
                                    const Icon = plan.icon;
                                    return (
                                        <Link
                                            key={plan.id}
                                            href={`/plans?selected=${plan.id}`}
                                            className={`p-4 rounded-xl border-2 transition-all relative group cursor-pointer ${plan.popular
                                                ? "border-primary bg-primary/10"
                                                : `border-[var(--glass-border)] bg-background-tertiary ${plan.borderColor}`
                                                }`}
                                        >
                                            {plan.popular && (
                                                <span className="absolute -top-2 right-4 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-10 h-10 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                                                    <Icon className={`w-5 h-5 ${plan.color}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white">{plan.name}</h3>
                                                    <p className="text-xs text-foreground-muted">{plan.description}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-foreground-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                            <p className={`text-2xl font-bold ${plan.color} mb-3`}>
                                                {plan.price}
                                                <span className="text-xs text-foreground-muted font-normal"> /event</span>
                                            </p>
                                            <ul className="space-y-1">
                                                {plan.features.slice(0, 4).map((feature, idx) => (
                                                    <li key={idx} className="text-xs text-foreground-muted flex items-center gap-2">
                                                        <Check className={`w-3 h-3 ${plan.color}`} />
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

                            {/* Recent Payment Methods Used */}
                            <h3 className="text-sm font-medium text-foreground-muted mt-6 mb-3">Recently Used</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background-tertiary">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-white">Card •••• 4242</span>
                                    <span className="text-xs text-foreground-muted ml-auto">Last used 3 days ago</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background-tertiary">
                                    <Building2 className="w-4 h-4 text-secondary" />
                                    <span className="text-sm text-white">FPX Maybank</span>
                                    <span className="text-xs text-foreground-muted ml-auto">Last used 8 days ago</span>
                                </div>
                            </div>
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
                                {paymentHistory.map((payment) => (
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
