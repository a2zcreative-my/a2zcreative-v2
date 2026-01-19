"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import {
    Sparkles,
    Flower2,
    Square,
    Crown,
    Palmtree,
    Building2,
    Leaf,
    Moon,
    TreeDeciduous,
    PartyPopper,
    Star,
    Gem,
    ArrowLeft,
    ArrowRight,
    type LucideIcon,
} from "lucide-react";

const templateIcons: Record<string, LucideIcon> = {
    "elegant-gold": Sparkles,
    "floral-blush": Flower2,
    "modern-minimal": Square,
    "royal-purple": Crown,
    "tropical-vibes": Palmtree,
    "corporate-blue": Building2,
    "garden-party": Leaf,
    "night-gala": Moon,
    "rustic-charm": TreeDeciduous,
    "kids-fun": PartyPopper,
    "islamic-art": Star,
    "luxury-black": Gem,
};

const templates = [
    { id: "elegant-gold", name: "Elegant Gold", category: "Wedding", tier: "premium" },
    { id: "floral-blush", name: "Floral Blush", category: "Wedding", tier: "basic" },
    { id: "modern-minimal", name: "Modern Minimal", category: "All", tier: "starter" },
    { id: "royal-purple", name: "Royal Purple", category: "VIP", tier: "exclusive" },
    { id: "tropical-vibes", name: "Tropical Vibes", category: "Birthday", tier: "starter" },
    { id: "corporate-blue", name: "Corporate Blue", category: "Corporate", tier: "basic" },
    { id: "garden-party", name: "Garden Party", category: "All", tier: "basic" },
    { id: "night-gala", name: "Night Gala", category: "VIP", tier: "premium" },
    { id: "rustic-charm", name: "Rustic Charm", category: "Wedding", tier: "premium" },
    { id: "kids-fun", name: "Kids Fun", category: "Birthday", tier: "starter" },
    { id: "islamic-art", name: "Islamic Art", category: "Religious", tier: "basic" },
    { id: "luxury-black", name: "Luxury Black", category: "VIP", tier: "exclusive" },
];

const categories = ["All", "Wedding", "Birthday", "Corporate", "VIP", "Religious"];

export default function TemplatePage() {
    const params = useParams();
    const id = params?.id as string;
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const filteredTemplates = selectedCategory === "All"
        ? templates
        : templates.filter(t => t.category === selectedCategory || t.category === "All");

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={1} eventId={id} />

            {/* Header */}
            <div className="text-center mb-10 animate-fade-in">
                <Link href={`/events/create/details`} className="inline-flex items-center gap-2 text-foreground-muted hover:text-white mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Details
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Choose Your Template
                </h1>
                <p className="text-foreground-muted">
                    Select a beautiful design for your invitation
                </p>
            </div>

            {/* Category Filter */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedCategory === category
                                ? "bg-primary text-white"
                                : "bg-background-tertiary text-foreground-muted hover:text-white"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map((template, index) => {
                    return (
                        <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`glass-card overflow-hidden cursor-pointer transition-all duration-300 animate-fade-in group ${selectedTemplate === template.id
                                ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                : "hover:border-white/20 hover:scale-[1.02]"
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Preview Image */}
                            <div className="aspect-[3/4] relative overflow-hidden">
                                <img
                                    src={`/templates/${template.id}.png`}
                                    alt={template.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Selected checkmark */}
                                {selectedTemplate === template.id && (
                                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                                    <span className={`badge-${template.tier} text-[10px] font-bold px-2 py-0.5 rounded-full text-white`}>
                                        {template.tier.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-foreground-muted">{template.category}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Continue Button */}
            {selectedTemplate && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-secondary/90 backdrop-blur-xl border-t border-[var(--glass-border)]">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">
                                {templates.find(t => t.id === selectedTemplate)?.name}
                            </p>
                            <p className="text-foreground-muted text-sm">Template selected</p>
                        </div>
                        <Link
                            href={`/events/${id}/theme?template=${selectedTemplate}`}
                            className="btn-primary flex items-center gap-2"
                        >
                            Customize Theme
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
