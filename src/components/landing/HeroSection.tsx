"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Sparkles,
    Heart,
    Zap,
    Check,
    ArrowRight,
    Globe,
} from "lucide-react";

const eventTypes = [
    {
        id: "wedding",
        name: "WEDDING",
        tagline: "Classic Romance",
        image: "/event-wedding.png",
        mockup: "/hero-phone-mockup.png",
    },
    {
        id: "engagement",
        name: "ENGAGEMENT",
        tagline: "Modern Love",
        image: "/event-engagement.png",
        mockup: "/phone-engagement.png",
    },
    {
        id: "birthday",
        name: "BIRTHDAY",
        tagline: "Fun & Festive",
        image: "/event-birthday.png",
        mockup: "/phone-birthday.png",
    },
    {
        id: "aqiqah",
        name: "AQIQAH",
        tagline: "Baby Celebration",
        image: "/event-aqiqah.png",
        mockup: "/phone-aqiqah.png",
    },
];

export default function HeroSection() {
    const [selectedEvent, setSelectedEvent] = useState("wedding");

    const currentEvent = eventTypes.find((e) => e.id === selectedEvent) || eventTypes[0];

    return (
        <section className="min-h-screen hero-gradient flex items-center pt-20 px-6">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 hero-split">
                    {/* Left Side - Content */}
                    <div className="flex-1 lg:max-w-xl">
                        <div className="badge-animated mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Popular Choice</span>
                            <Zap className="w-3 h-3" />
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Create
                            <br />
                            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                BEAUTIFUL
                            </span>
                            <br />
                            Invitations
                        </h1>

                        <p className="text-lg text-foreground-muted mb-8 max-w-md">
                            Design stunning digital invitations for weddings, engagements, and celebrations.
                            Share instantly via WhatsApp and track RSVPs with ease.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                            <Link href="/auth/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 animate-glow">
                                <span>Start Creating</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/ahmad-alia" className="btn-secondary text-lg px-6 py-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-primary" />
                                </div>
                                <span>Watch Demo</span>
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-6 text-foreground-muted text-sm">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-success" />
                                <span>No App Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-success" />
                                <span>Instant Sharing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-success" />
                                <span>Malaysian Made</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Visual Showcase & Event Cards */}
                    <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                        {/* Phone Mockup */}
                        <div className="relative animate-float order-2 lg:order-1">
                            <Image
                                key={currentEvent.id}
                                src={currentEvent.mockup}
                                alt={`${currentEvent.name} Invitation Preview`}
                                width={280}
                                height={560}
                                className="phone-mockup hidden lg:block transition-opacity duration-300"
                                priority
                            />
                            {/* Decorative Elements */}
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl" />
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/20 rounded-full blur-xl" />
                        </div>

                        {/* Event Type Cards */}
                        <div className="flex flex-row lg:flex-col gap-3 event-cards-container order-1 lg:order-2">
                            <p className="hidden lg:block text-xs text-foreground-muted uppercase tracking-wider mb-2">
                                Select Event
                            </p>

                            {eventTypes.map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event.id)}
                                    className={`event-card ${selectedEvent === event.id ? "active" : ""}`}
                                >
                                    <Image
                                        src={event.image}
                                        alt={event.name}
                                        width={64}
                                        height={64}
                                        className="event-card-image"
                                    />
                                    <div className="event-card-content">
                                        <h4>{event.name}</h4>
                                        <p>{event.tagline}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Heart className="absolute top-40 right-1/4 w-16 h-16 text-primary/5" />
                <Sparkles className="absolute bottom-40 left-20 w-12 h-12 text-secondary/5" />
                <Globe className="absolute top-1/3 left-1/4 w-8 h-8 text-accent/5" />
            </div>
        </section>
    );
}
