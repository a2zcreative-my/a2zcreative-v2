"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import {
    Palette,
    PenTool,
    Image,
    Square,
    Sparkles,
    Star,
    ArrowLeft,
    ArrowRight,
    Flower2,
    type LucideIcon,
} from "lucide-react";

const backgroundIcons: Record<string, LucideIcon> = {
    solid: Square,
    gradient: Palette,
    pattern: Image,
    floral: Flower2,
    particles: Sparkles,
    sparkle: Star,
};

const colorPalettes = [
    { id: "gold-elegant", name: "Gold Elegant", colors: ["#D4AF37", "#1a1a24", "#ffffff", "#f5f5dc"] },
    { id: "blush-romance", name: "Blush Romance", colors: ["#FFB6C1", "#FFF0F5", "#8B4557", "#ffffff"] },
    { id: "ocean-blue", name: "Ocean Blue", colors: ["#0077B6", "#00B4D8", "#90E0EF", "#ffffff"] },
    { id: "forest-green", name: "Forest Green", colors: ["#228B22", "#2D5A27", "#90EE90", "#ffffff"] },
    { id: "royal-purple", name: "Royal Purple", colors: ["#6A0DAD", "#9B30FF", "#E6E6FA", "#ffffff"] },
    { id: "sunset-orange", name: "Sunset Orange", colors: ["#FF6B35", "#F7C59F", "#FF8C42", "#ffffff"] },
    { id: "cherry-blossom", name: "Cherry Blossom", colors: ["#FFB7C5", "#FFC0CB", "#F8E8E8", "#ffffff"] },
    { id: "midnight-dark", name: "Midnight Dark", colors: ["#0a0a12", "#6366f1", "#8b5cf6", "#ffffff"] },
];

const fontStyles = [
    { id: "classic", name: "Classic Serif", family: "Playfair Display, serif" },
    { id: "modern", name: "Modern Sans", family: "Poppins, sans-serif" },
    { id: "elegant", name: "Elegant Script", family: "Dancing Script, cursive" },
    { id: "minimal", name: "Minimal Clean", family: "Inter, sans-serif" },
    { id: "traditional", name: "Traditional", family: "Lora, serif" },
    { id: "bold", name: "Bold Impact", family: "Montserrat, sans-serif" },
];

const backgrounds = [
    { id: "solid", name: "Solid Color", type: "static" },
    { id: "gradient", name: "Gradient", type: "static" },
    { id: "pattern", name: "Subtle Pattern", type: "static" },
    { id: "floral", name: "Floral Overlay", type: "static" },
    { id: "particles", name: "Floating Particles", type: "animated", premium: true },
    { id: "sparkle", name: "Sparkle Effect", type: "animated", premium: true },
];

export default function ThemePage() {
    const params = useParams();
    const id = params?.id as string;
    const [selectedPalette, setSelectedPalette] = useState("gold-elegant");
    const [selectedFont, setSelectedFont] = useState("classic");
    const [selectedBg, setSelectedBg] = useState("gradient");

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={2} eventId={id} />

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href={`/events/${id}/template`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Templates
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Customize Theme</h1>
                <p className="text-foreground-muted">Personalize your invitation with preset styles</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Color Palette */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Color Palette
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {colorPalettes.map((palette) => (
                            <button
                                key={palette.id}
                                onClick={() => setSelectedPalette(palette.id)}
                                className={`p-4 rounded-xl transition-all ${selectedPalette === palette.id
                                    ? "ring-2 ring-primary bg-primary/10"
                                    : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                    }`}
                            >
                                <div className="flex gap-1 mb-3">
                                    {palette.colors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-full border border-white/20"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-white font-medium">{palette.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Style */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-primary" />
                        Font Style
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {fontStyles.map((font) => (
                            <button
                                key={font.id}
                                onClick={() => setSelectedFont(font.id)}
                                className={`p-4 rounded-xl text-center transition-all ${selectedFont === font.id
                                    ? "ring-2 ring-primary bg-primary/10"
                                    : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                    }`}
                            >
                                <p
                                    className="text-xl text-white mb-2"
                                    style={{ fontFamily: font.family }}
                                >
                                    Aa Bb Cc
                                </p>
                                <p className="text-sm text-foreground-muted">{font.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Background Style */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Image className="w-5 h-5 text-primary" />
                        Background Style
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {backgrounds.map((bg) => {
                            const BgIcon = backgroundIcons[bg.id] || Square;
                            return (
                                <button
                                    key={bg.id}
                                    onClick={() => !bg.premium && setSelectedBg(bg.id)}
                                    className={`p-4 rounded-xl text-center transition-all relative ${selectedBg === bg.id
                                        ? "ring-2 ring-primary bg-primary/10"
                                        : bg.premium
                                            ? "bg-background-tertiary opacity-60 cursor-not-allowed"
                                            : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                        <BgIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-sm text-white font-medium">{bg.name}</p>
                                    <p className="text-xs text-foreground-muted capitalize">{bg.type}</p>
                                    {bg.premium && (
                                        <span className="absolute top-2 right-2 text-xs bg-premium/20 text-premium px-2 py-0.5 rounded-full">
                                            Premium+
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4">
                    <Link href={`/events/${id}/template`} className="btn-secondary flex-1 text-center flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <Link href={`/events/${id}/music`} className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
                        Continue to Music
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
