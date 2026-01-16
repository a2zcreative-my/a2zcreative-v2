"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import {
    MapPin,
    Calendar,
    User,
    Gift,
    Image,
    Video,
    Clock,
    MessageSquare,
    Gem,
    ArrowLeft,
    ArrowRight,
    type LucideIcon,
} from "lucide-react";

const sectionIcons: Record<string, LucideIcon> = {
    location: MapPin,
    itinerary: Calendar,
    contact: User,
    gift: Gift,
    gallery: Image,
    video: Video,
    countdown: Clock,
    wishes: MessageSquare,
};

const sections = [
    { id: "location", name: "Location & Map", description: "Venue with Google Maps", required: true },
    { id: "itinerary", name: "Itinerary / Tentative", description: "Event timeline schedule" },
    { id: "contact", name: "Contact Person", description: "WhatsApp click-to-chat" },
    { id: "gift", name: "Gift / Bank Details", description: "Bank transfer & e-wallet info" },
    { id: "gallery", name: "Photo Gallery", description: "Upload event photos", premium: true },
    { id: "video", name: "Video Section", description: "Embed YouTube / upload video", premium: true },
    { id: "countdown", name: "Countdown Timer", description: "Days until event" },
    { id: "wishes", name: "Guest Wishes", description: "Let guests leave messages" },
];

export default function SectionsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>({
        location: true,
        itinerary: true,
        contact: true,
        gift: true,
        gallery: false,
        video: false,
        countdown: true,
        wishes: false,
    });

    const toggleSection = (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId);
        if (section?.required || section?.premium) return;
        setEnabledSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const enabledCount = Object.values(enabledSections).filter(Boolean).length;

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={4} eventId={id} />

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href={`/events/${id}/music`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Music
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Event Sections</h1>
                        <p className="text-foreground-muted">Choose which sections to include in your invitation</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{enabledCount}</p>
                        <p className="text-xs text-foreground-muted">sections enabled</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
                {sections.map((section) => {
                    const SectionIcon = sectionIcons[section.id] || MapPin;
                    return (
                        <div
                            key={section.id}
                            className={`glass-card p-5 flex items-center justify-between transition-all ${enabledSections[section.id] ? "border-primary/30" : ""
                                } ${section.premium ? "opacity-60" : ""}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <SectionIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white">{section.name}</h3>
                                        {section.required && (
                                            <span className="text-xs bg-info/20 text-info px-2 py-0.5 rounded-full">Required</span>
                                        )}
                                        {section.premium && (
                                            <span className="text-xs bg-premium/20 text-premium px-2 py-0.5 rounded-full">Premium+</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-foreground-muted">{section.description}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleSection(section.id)}
                                disabled={section.required || section.premium}
                                className={`w-14 h-8 rounded-full transition-all ${enabledSections[section.id] ? "bg-primary" : "bg-background-tertiary"
                                    } ${section.required || section.premium ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full transition-transform mx-1 ${enabledSections[section.id] ? "translate-x-6" : "translate-x-0"
                                    }`} />
                            </button>
                        </div>
                    );
                })}

                {/* Upgrade Notice */}
                <div className="glass-card p-4 border-premium/30 bg-premium/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-premium/20 flex items-center justify-center">
                            <Gem className="w-5 h-5 text-premium" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-medium">Unlock Gallery & Video sections</p>
                            <p className="text-sm text-foreground-muted">Upgrade to Premium or Exclusive plan</p>
                        </div>
                        <button className="btn-secondary text-sm">Upgrade</button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 pt-4">
                    <Link href={`/events/${id}/music`} className="btn-secondary flex-1 text-center flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <Link href={`/events/${id}/contact`} className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
                        Continue to Contact
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
