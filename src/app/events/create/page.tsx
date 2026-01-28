"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
    Cake,
    PartyPopper,
    Moon,
    Home,
    Users,
    Gift,
    Heart,
    GraduationCap,
    Handshake,
    UtensilsCrossed,
    BookOpen,
    Baby,
    Gem,
    Church,
    Building2,
    Rocket,
    Wine,
    BookMarked,
    HeartHandshake,
    Crown,
    Sparkles,
    Mic,
    Landmark,
    Lock,
    Trophy,
    ArrowLeft,
    ArrowRight,
    Loader2,
    Star,
    type LucideIcon,
} from "lucide-react";

// Map event names to Lucide icons
const iconMap: Record<string, LucideIcon> = {
    "Birthday Party (Kids)": Cake,
    "Birthday Party (Adults)": PartyPopper,
    "Birthday Party": Cake,
    "Aqiqah / Doa Selamat": Moon,
    "Housewarming": Home,
    "Small Family Gathering": Users,
    "Small family gathering": Users,
    "Simple Surprise Party": Gift,
    "Simple surprise party": Gift,
    "Engagement / Nikah": Heart,
    "Graduation Celebration": GraduationCap,
    "Graduation celebration": GraduationCap,
    "Family Reunion": Handshake,
    "Family reunion": Handshake,
    "Kenduri Kecil": UtensilsCrossed,
    "Kenduri kecil": UtensilsCrossed,
    "Religious Talks / Ceramah": BookOpen,
    "Religious talks": BookOpen,
    "Baby Shower": Baby,
    "Wedding Reception": Church,
    "Wedding reception": Church,
    "Corporate Event": Building2,
    "Corporate event": Building2,
    "Product Launch": Rocket,
    "Product launch": Rocket,
    "Annual Dinner": Wine,
    "Annual dinner": Wine,
    "Seminar / Workshop": BookMarked,
    "Seminar / workshop": BookMarked,
    "Charity Gala": HeartHandshake,
    "VIP / Royal-style Wedding": Crown,
    "VIP / Royal-style wedding": Crown,
    "Private Gala Dinner": Sparkles,
    "Private gala dinner": Sparkles,
    "Conference / Summit": Mic,
    "Conference / summit": Mic,
    "Government / NGO Event": Landmark,
    "Government / NGO events": Landmark,
    "Invite-Only Exclusive Event": Lock,
    "Invite-only exclusive events": Lock,
    "Award Ceremony": Trophy,
};

const planIcons: Record<string, LucideIcon> = {
    starter: Cake,
    basic: Heart,
    premium: Gem,
    exclusive: Crown,
    Cake: Cake,
    Heart: Heart,
    Gem: Gem,
    Crown: Crown,
    Star: Star,
};

interface Plan {
    id: string;
    name: string;
    events: string[];
    icon?: string;
}

// Default event types (fallback if API fails)
const defaultEventTypes: Record<string, { title: string; events: string[] }> = {
    starter: {
        title: "Starter Pack Events",
        events: [
            "Birthday Party (Kids)",
            "Birthday Party (Adults)",
            "Aqiqah / Doa Selamat",
            "Housewarming",
            "Small Family Gathering",
            "Simple Surprise Party",
        ],
    },
    basic: {
        title: "Basic Pack Events",
        events: [
            "Engagement / Nikah",
            "Graduation Celebration",
            "Family Reunion",
            "Kenduri Kecil",
            "Religious Talks / Ceramah",
            "Baby Shower",
        ],
    },
    premium: {
        title: "Premium Pack Events",
        events: [
            "Wedding Reception",
            "Corporate Event",
            "Product Launch",
            "Annual Dinner",
            "Seminar / Workshop",
            "Charity Gala",
        ],
    },
    exclusive: {
        title: "Exclusive Plan Events",
        events: [
            "VIP / Royal-style Wedding",
            "Private Gala Dinner",
            "Conference / Summit",
            "Government / NGO Event",
            "Invite-Only Exclusive Event",
            "Award Ceremony",
        ],
    },
};

function CreateEventContent() {
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan") || "starter";
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [planData, setPlanData] = useState<{ title: string; events: string[]; icon?: string } | null>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await fetch('/api/plans');
                if (response.ok) {
                    const data = await response.json();
                    const plan = (data.plans || []).find((p: Plan) => p.id === planId);
                    if (plan && plan.events && plan.events.length > 0) {
                        setPlanData({
                            title: `${plan.name} Events`,
                            events: plan.events,
                            icon: plan.icon,
                        });
                    } else {
                        // Use default if plan not found or has no events
                        const defaultData = defaultEventTypes[planId] || defaultEventTypes.starter;
                        setPlanData(defaultData);
                    }
                } else {
                    // Fallback to defaults
                    const defaultData = defaultEventTypes[planId] || defaultEventTypes.starter;
                    setPlanData(defaultData);
                }
            } catch (error) {
                console.error('Failed to fetch plan:', error);
                const defaultData = defaultEventTypes[planId] || defaultEventTypes.starter;
                setPlanData(defaultData);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [planId]);

    const PlanIcon = planIcons[planData?.icon || planId] || Cake;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!planData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white">Plan not found</div>
            </div>
        );
    }

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
                    <ArrowLeft className="w-4 h-4" />
                    Change Plan
                </Link>
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <PlanIcon className="w-6 h-6 text-primary" />
                    </div>
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
                {planData.events.map((eventName, index) => {
                    const EventIcon = iconMap[eventName] || Gift;
                    return (
                        <div
                            key={eventName}
                            onClick={() => setSelectedType(eventName)}
                            className={`glass-card p-6 cursor-pointer transition-all duration-300 animate-fade-in text-center ${selectedType === eventName
                                ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                                : "hover:border-white/20"
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <EventIcon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="font-semibold text-white">{eventName}</h3>
                        </div>
                    );
                })}
            </div>

            {/* Continue Button */}
            {selectedType && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-secondary/90 backdrop-blur-xl border-t border-[var(--glass-border)]">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">{selectedType}</p>
                            <p className="text-foreground-muted text-sm capitalize">{planId} Pack</p>
                        </div>
                        <Link
                            href={`/events/new/builder?plan=${planId}&type=${encodeURIComponent(selectedType)}`}
                            className="btn-primary flex items-center gap-2"
                        >
                            Continue to Details
                            <ArrowRight className="w-4 h-4" />
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
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <CreateEventContent />
        </Suspense>
    );
}
