"use client";

import Link from "next/link";
import { useState } from "react";

const plans = [
    {
        id: "starter",
        name: "Starter Pack",
        price: "RM20",
        priceNote: "one-time",
        tagline: "I just need something fast & nice",
        color: "starter",
        gradient: "from-starter to-green-600",
        events: ["Birthday Party", "Aqiqah / Doa Selamat", "Housewarming", "Small family gathering", "Simple surprise party"],
        features: [
            "1 page invitation",
            "Basic theme selection",
            "Event details display",
            "WhatsApp share link",
            "Simple \"I'm attending\" button",
        ],
        notIncluded: ["RSVP with guest count", "Google Maps", "Theme customization", "Analytics"],
    },
    {
        id: "basic",
        name: "Basic Pack",
        price: "RM49",
        priceNote: "one-time",
        tagline: "I want it to look proper & organized",
        color: "basic",
        gradient: "from-basic to-blue-600",
        popular: true,
        events: ["Engagement / Nikah", "Graduation celebration", "Family reunion", "Kenduri kecil", "Religious talks"],
        features: [
            "RSVP with guest count",
            "Google Maps integration",
            "Date countdown timer",
            "Multiple sections (Tentative, Location, Contact)",
            "Theme customization (color / font)",
        ],
        notIncluded: ["Custom domain", "Photo gallery", "Analytics"],
    },
    {
        id: "premium",
        name: "Premium Pack",
        price: "RM99",
        priceNote: "one-time",
        tagline: "This event represents me / us",
        color: "premium",
        gradient: "from-premium to-orange-600",
        events: ["Wedding reception", "Corporate event", "Product launch", "Annual dinner", "Seminar / workshop"],
        features: [
            "Custom domain/subdomain",
            "Photo & video gallery",
            "Advanced RSVP (diet, pax, notes)",
            "Calendar sync",
            "Analytics (views, attendance)",
            "Background music / animation",
        ],
        notIncluded: ["QR Check-in", "Multiple invite links"],
    },
    {
        id: "exclusive",
        name: "Exclusive Plan",
        price: "RM199.99",
        priceNote: "one-time",
        tagline: "This event must look elite & controlled",
        color: "exclusive",
        gradient: "from-exclusive to-pink-600",
        events: ["VIP / Royal-style wedding", "Private gala dinner", "Conference / summit", "Government / NGO events", "Invite-only exclusive events"],
        features: [
            "Organizer dashboard",
            "Multiple invitation links (VIP / Public / Staff)",
            "QR check-in system",
            "Guest approval system",
            "Custom branding (logo, colors)",
            "Priority support",
            "Export guest data (Excel)",
        ],
        notIncluded: [],
    },
];

export default function PlansPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
                <Link href="/login" className="inline-flex items-center gap-2 text-foreground-muted hover:text-white mb-6">
                    ← Back to Login
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
                    Select the perfect package for your event. <span className="text-primary">The more important the event, the higher the plan.</span>
                </p>
            </div>

            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan, index) => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative glass-card p-6 cursor-pointer transition-all duration-300 animate-fade-in ${selectedPlan === plan.id
                                ? `ring-2 ring-${plan.color} shadow-lg shadow-${plan.color}/20`
                                : "hover:border-white/20"
                            }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-basic text-white text-xs font-bold px-3 py-1 rounded-full">
                                    POPULAR
                                </span>
                            </div>
                        )}

                        {/* Plan Header */}
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-3xl mb-4`}>
                                {plan.id === "starter" && "🎂"}
                                {plan.id === "basic" && "💝"}
                                {plan.id === "premium" && "💎"}
                                {plan.id === "exclusive" && "👑"}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                            <p className="text-sm text-foreground-muted italic">&quot;{plan.tagline}&quot;</p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-6">
                            <span className={`text-4xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                                {plan.price}
                            </span>
                            <span className="text-sm text-foreground-muted ml-1">{plan.priceNote}</span>
                        </div>

                        {/* Suitable Events */}
                        <div className="mb-6">
                            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-2">
                                Perfect for:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {plan.events.slice(0, 3).map((event) => (
                                    <span key={event} className="text-xs bg-background-tertiary text-foreground-muted px-2 py-1 rounded-lg">
                                        {event}
                                    </span>
                                ))}
                                {plan.events.length > 3 && (
                                    <span className="text-xs text-foreground-muted px-2 py-1">
                                        +{plan.events.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 mb-6">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-2 text-sm">
                                    <span className="text-success mt-0.5">✓</span>
                                    <span className="text-foreground">{feature}</span>
                                </div>
                            ))}
                            {plan.notIncluded.slice(0, 2).map((feature) => (
                                <div key={feature} className="flex items-start gap-2 text-sm">
                                    <span className="text-foreground-muted mt-0.5">✗</span>
                                    <span className="text-foreground-muted">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Select Button */}
                        <button
                            className={`w-full py-3 rounded-xl font-semibold transition-all ${selectedPlan === plan.id
                                    ? `bg-gradient-to-r ${plan.gradient} text-white`
                                    : "bg-background-tertiary text-foreground-muted hover:text-white"
                                }`}
                        >
                            {selectedPlan === plan.id ? "✓ Selected" : "Select Plan"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Continue Button */}
            {selectedPlan && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-secondary/90 backdrop-blur-xl border-t border-[var(--glass-border)]">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">
                                {plans.find(p => p.id === selectedPlan)?.name} selected
                            </p>
                            <p className="text-foreground-muted text-sm">
                                {plans.find(p => p.id === selectedPlan)?.price}
                            </p>
                        </div>
                        <Link
                            href={`/events/create?plan=${selectedPlan}`}
                            className="btn-primary"
                        >
                            Continue to Create Event →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
