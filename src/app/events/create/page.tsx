"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const eventTypes: Record<string, { title: string; icon: string; events: { name: string; icon: string }[] }> = {
    starter: {
        title: "Starter Pack Events",
        icon: "🎂",
        events: [
            { name: "Birthday Party (Kids)", icon: "🎈" },
            { name: "Birthday Party (Adults)", icon: "🎉" },
            { name: "Aqiqah / Doa Selamat", icon: "🌙" },
            { name: "Housewarming", icon: "🏠" },
            { name: "Small Family Gathering", icon: "👨‍👩‍👧‍👦" },
            { name: "Simple Surprise Party", icon: "🎁" },
        ],
    },
    basic: {
        title: "Basic Pack Events",
        icon: "💝",
        events: [
            { name: "Engagement / Nikah", icon: "💍" },
            { name: "Graduation Celebration", icon: "🎓" },
            { name: "Family Reunion", icon: "🤝" },
            { name: "Kenduri Kecil", icon: "🍽️" },
            { name: "Religious Talks / Ceramah", icon: "📖" },
            { name: "Baby Shower", icon: "👶" },
        ],
    },
    premium: {
        title: "Premium Pack Events",
        icon: "💎",
        events: [
            { name: "Wedding Reception", icon: "💒" },
            { name: "Corporate Event", icon: "🏢" },
            { name: "Product Launch", icon: "🚀" },
            { name: "Annual Dinner", icon: "🍷" },
            { name: "Seminar / Workshop", icon: "📚" },
            { name: "Charity Gala", icon: "❤️" },
        ],
    },
    exclusive: {
        title: "Exclusive Plan Events",
        icon: "👑",
        events: [
            { name: "VIP / Royal-style Wedding", icon: "👑" },
            { name: "Private Gala Dinner", icon: "✨" },
            { name: "Conference / Summit", icon: "🎤" },
            { name: "Government / NGO Event", icon: "🏛️" },
            { name: "Invite-Only Exclusive Event", icon: "🔒" },
            { name: "Award Ceremony", icon: "🏆" },
        ],
    },
};

function CreateEventContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan") || "starter";
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const planData = eventTypes[plan] || eventTypes.starter;

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                            1
                        </div>
                        <span className="text-white font-medium">Event Type</span>
                    </div>
                    <div className="flex-1 h-1 mx-4 bg-background-tertiary rounded-full">
                        <div className="h-full w-1/3 bg-gradient-to-r from-primary to-secondary rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center text-foreground-muted font-bold text-sm">
                            2
                        </div>
                        <span className="text-foreground-muted">Details</span>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="text-center mb-10 animate-fade-in">
                <Link href="/plans" className="inline-flex items-center gap-2 text-foreground-muted hover:text-white mb-4">
                    ← Change Plan
                </Link>
                <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-4xl">{planData.icon}</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        {planData.title}
                    </h1>
                </div>
                <p className="text-foreground-muted">
                    Select the type of event you want to create
                </p>
            </div>

            {/* Event Types Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
                {planData.events.map((event, index) => (
                    <div
                        key={event.name}
                        onClick={() => setSelectedType(event.name)}
                        className={`glass-card p-6 cursor-pointer transition-all duration-300 animate-fade-in text-center ${selectedType === event.name
                                ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                                : "hover:border-white/20"
                            }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="text-5xl mb-4">{event.icon}</div>
                        <h3 className="font-semibold text-white">{event.name}</h3>
                    </div>
                ))}
            </div>

            {/* Continue Button */}
            {selectedType && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-secondary/90 backdrop-blur-xl border-t border-[var(--glass-border)]">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">{selectedType}</p>
                            <p className="text-foreground-muted text-sm capitalize">{plan} Pack</p>
                        </div>
                        <Link
                            href={`/events/create/details?plan=${plan}&type=${encodeURIComponent(selectedType)}`}
                            className="btn-primary"
                        >
                            Continue to Details →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CreateEventPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <CreateEventContent />
        </Suspense>
    );
}
