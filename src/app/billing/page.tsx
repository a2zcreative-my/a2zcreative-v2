"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { CreditCard, Building2, FileText } from "lucide-react";

const paymentHistory = [
    { id: "1", event: "Majlis Perkahwinan Ahmad & Alia", plan: "Premium", amount: 134, date: "15 Jan 2026", status: "paid" },
    { id: "2", event: "Birthday Bash - Aiman", plan: "Basic", amount: 49, date: "10 Jan 2026", status: "paid" },
    { id: "3", event: "Aqiqah Baby Arya", plan: "Starter", amount: 20, date: "1 Dec 2025", status: "paid" },
];

const plans = [
    { id: "starter", name: "Starter Pack", price: "RM20", current: false },
    { id: "basic", name: "Basic Pack", price: "RM49", current: false },
    { id: "premium", name: "Premium Pack", price: "RM99", current: true },
    { id: "exclusive", name: "Exclusive Plan", price: "RM199.99", current: false },
];

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Billing & Plans</h1>
                    <p className="text-foreground-muted">Manage your subscription and view payment history</p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Current Stats */}
                        <div className="lg:col-span-2 space-y-6">
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

                            {/* Available Plans */}
                            <div className="glass-card p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">Available Plans</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`p-4 rounded-xl border-2 transition-all ${plan.current
                                                ? "border-primary bg-primary/10"
                                                : "border-[var(--glass-border)] bg-background-tertiary"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-white">{plan.name}</h3>
                                                {plan.current && (
                                                    <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                                        Last Used
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-2xl font-bold badge-${plan.id} bg-clip-text text-transparent`}>
                                                {plan.price}
                                            </p>
                                            <p className="text-xs text-foreground-muted mt-1">per event</p>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/plans" className="btn-primary w-full text-center mt-4 block">
                                    Create New Event
                                </Link>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Saved Payment Methods</h2>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-background-tertiary flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">•••• •••• •••• 4242</p>
                                        <p className="text-xs text-foreground-muted">Expires 12/28</p>
                                    </div>
                                    <span className="text-xs text-success">Default</span>
                                </div>
                                <div className="p-4 rounded-xl bg-background-tertiary flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-secondary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">Maybank FPX</p>
                                        <p className="text-xs text-foreground-muted">Online Banking</p>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-secondary w-full mt-4">
                                + Add Payment Method
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="glass-card overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-[var(--glass-border)]">
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Event</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Plan</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Amount</th>
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
                                            <span className="text-foreground-muted">{payment.date}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                                                PAID
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-primary text-sm hover:text-primary-hover flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                Download
                                            </button>
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
