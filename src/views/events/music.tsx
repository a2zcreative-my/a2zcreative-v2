"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState, use } from "react";
import StepIndicator from "@/components/StepIndicator";

const musicLibrary = [
    { id: "romantic-piano", name: "Romantic Piano", duration: "3:24", category: "Wedding" },
    { id: "acoustic-love", name: "Acoustic Love", duration: "2:58", category: "Wedding" },
    { id: "traditional-malay", name: "Traditional Malay", duration: "3:45", category: "Cultural" },
    { id: "gamelan-soft", name: "Gamelan Soft", duration: "4:12", category: "Cultural" },
    { id: "happy-birthday", name: "Happy Celebration", duration: "2:30", category: "Birthday" },
    { id: "corporate-inspire", name: "Corporate Inspire", duration: "3:00", category: "Corporate" },
    { id: "gentle-strings", name: "Gentle Strings", duration: "3:35", category: "All" },
    { id: "joyful-day", name: "Joyful Day", duration: "2:45", category: "All" },
];

const categories = ["All", "Wedding", "Birthday", "Corporate", "Cultural"];

export default function MusicPage() {
    const params = useParams(); const id = params?.id as string;
    const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [autoMute, setAutoMute] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isPlaying, setIsPlaying] = useState<string | null>(null);

    const filteredMusic = selectedCategory === "All"
        ? musicLibrary
        : musicLibrary.filter(m => m.category === selectedCategory || m.category === "All");

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={3} eventId={id} />

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href={`/events/${id}/theme`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    ← Back to Theme
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Add Music 🎵</h1>
                <p className="text-foreground-muted">Add emotional background music to your invitation</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Enable Background Music</h2>
                            <p className="text-sm text-foreground-muted">Music will play when guests open your invitation</p>
                        </div>
                        <button
                            onClick={() => setMusicEnabled(!musicEnabled)}
                            className={`w-14 h-8 rounded-full transition-all ${musicEnabled ? "bg-primary" : "bg-background-tertiary"
                                }`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform mx-1 ${musicEnabled ? "translate-x-6" : "translate-x-0"
                                }`} />
                        </button>
                    </div>
                </div>

                {musicEnabled && (
                    <>
                        {/* Auto-mute Setting */}
                        <div className="glass-card p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🔇</span>
                                    <div>
                                        <p className="text-white font-medium">Auto-mute on open</p>
                                        <p className="text-xs text-foreground-muted">Best UX practice - guests tap to unmute</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAutoMute(!autoMute)}
                                    className={`w-12 h-6 rounded-full transition-all ${autoMute ? "bg-success" : "bg-background-tertiary"
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${autoMute ? "translate-x-6" : "translate-x-0"
                                        }`} />
                                </button>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                                        ? "bg-primary text-white"
                                        : "bg-background-tertiary text-foreground-muted hover:text-white"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Music Library */}
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 border-b border-[var(--glass-border)]">
                                <h2 className="font-semibold text-white">Music Library</h2>
                            </div>
                            <div className="divide-y divide-[var(--glass-border)]">
                                {filteredMusic.map((track) => (
                                    <div
                                        key={track.id}
                                        onClick={() => setSelectedMusic(track.id)}
                                        className={`p-4 flex items-center justify-between cursor-pointer transition-all ${selectedMusic === track.id
                                            ? "bg-primary/10"
                                            : "hover:bg-[var(--glass-bg)]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsPlaying(isPlaying === track.id ? null : track.id);
                                                }}
                                                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                                            >
                                                {isPlaying === track.id ? "⏸" : "▶️"}
                                            </button>
                                            <div>
                                                <p className="text-white font-medium">{track.name}</p>
                                                <p className="text-xs text-foreground-muted">{track.category} • {track.duration}</p>
                                            </div>
                                        </div>
                                        {selectedMusic === track.id && (
                                            <span className="text-primary text-sm font-medium">✓ Selected</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Navigation */}
                <div className="flex gap-4">
                    <Link href={`/events/${id}/theme`} className="btn-secondary flex-1 text-center">
                        ← Back
                    </Link>
                    <Link href={`/events/${id}/sections`} className="btn-primary flex-1 text-center">
                        Continue to Sections →
                    </Link>
                </div>
            </div>
        </div>
    );
}


