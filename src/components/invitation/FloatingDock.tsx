"use client";

import { useState } from "react";
import { Phone, Volume2, VolumeX, Gift, FileText, Home, MapPin, Calendar, Heart } from "lucide-react";

interface FloatingDockProps {
    onContactClick: () => void;
    onMusicToggle: () => void;
    isMusicPlaying: boolean;
}

export default function FloatingDock({ onContactClick, onMusicToggle, isMusicPlaying }: FloatingDockProps) {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const dockItems = [
        {
            id: 'contact',
            icon: <Phone className="w-5 h-5" />,
            label: 'Contact',
            action: onContactClick
        },
        {
            id: 'music',
            icon: isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />,
            label: isMusicPlaying ? 'Mute' : 'Unmute',
            action: onMusicToggle
        },
        {
            id: 'gift',
            icon: <Gift className="w-5 h-5" />,
            label: 'Gift',
            action: () => scrollToSection('gift-section')
        },
        {
            id: 'rsvp',
            icon: <FileText className="w-5 h-5" />,
            label: 'RSVP',
            action: () => scrollToSection('rsvp-section')
        },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            {/* Dock Container */}
            <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-[var(--glass-border)] shadow-2xl">
                {dockItems.map((item) => (
                    <div key={item.id} className="relative">
                        {/* Tooltip */}
                        {activeTooltip === item.id && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-background border border-[var(--glass-border)] text-xs text-white whitespace-nowrap shadow-xl">
                                {item.label}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 bg-background border-r border-b border-[var(--glass-border)]" />
                            </div>
                        )}

                        {/* Button */}
                        <button
                            onClick={item.action}
                            onMouseEnter={() => setActiveTooltip(item.id)}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${item.id === 'music' && isMusicPlaying
                                    ? 'bg-primary/20 text-primary ring-2 ring-primary/50'
                                    : 'text-foreground-muted hover:text-primary hover:bg-primary/10'
                                }`}
                        >
                            {item.icon}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
