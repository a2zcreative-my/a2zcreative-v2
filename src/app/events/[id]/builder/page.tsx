"use client";

import Link from "next/link";
import { useState, use } from "react";

const textStyles = ["Heading", "Subheading", "Body", "Caption"];
const fontFamilies = ["Playfair Display", "Poppins", "Montserrat", "Lora", "Dancing Script"];
const colors = ["#ffffff", "#f59e0b", "#ec4899", "#22c55e", "#3b82f6", "#8b5cf6"];

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState<"text" | "colors" | "photos" | "elements">("text");
    const [selectedElement, setSelectedElement] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel - Tools */}
            <div className="w-64 bg-background-secondary border-r border-[var(--glass-border)] flex flex-col">
                <div className="p-4 border-b border-[var(--glass-border)]">
                    <Link href={`/events/${id}/template`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2">
                        ← Back to Templates
                    </Link>
                </div>

                {/* Tool Tabs */}
                <div className="flex border-b border-[var(--glass-border)]">
                    {(["text", "colors", "photos", "elements"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-foreground-muted hover:text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tool Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {activeTab === "text" && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-2">Text Styles</p>
                                <div className="space-y-2">
                                    {textStyles.map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => setSelectedElement(style)}
                                            className="w-full p-3 text-left rounded-lg bg-background-tertiary hover:bg-[var(--glass-bg)] transition-colors"
                                        >
                                            <span className="text-white">{style}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-2">Fonts</p>
                                <div className="space-y-2">
                                    {fontFamilies.map((font) => (
                                        <button
                                            key={font}
                                            className="w-full p-2 text-left rounded-lg bg-background-tertiary hover:bg-[var(--glass-bg)] transition-colors text-sm text-foreground"
                                        >
                                            {font}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "colors" && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-2">Theme Colors</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            className="w-full aspect-square rounded-lg border-2 border-transparent hover:border-white transition-colors"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-2">Background</p>
                                <input type="color" className="w-full h-10 rounded-lg cursor-pointer" defaultValue="#0a0a12" />
                            </div>
                        </div>
                    )}

                    {activeTab === "photos" && (
                        <div className="space-y-4">
                            <button className="w-full p-4 rounded-lg border-2 border-dashed border-[var(--glass-border)] text-foreground-muted hover:text-white hover:border-primary transition-colors text-center">
                                <span className="text-2xl mb-2 block">📷</span>
                                Upload Photo
                            </button>
                            <p className="text-xs text-foreground-muted text-center">
                                Drag & drop or click to upload
                            </p>
                        </div>
                    )}

                    {activeTab === "elements" && (
                        <div className="space-y-4">
                            <p className="text-xs text-foreground-muted uppercase tracking-wide mb-2">Add Elements</p>
                            <div className="grid grid-cols-2 gap-2">
                                {["🎉", "💒", "💍", "🌸", "✨", "❤️", "🎂", "🎈"].map((emoji) => (
                                    <button
                                        key={emoji}
                                        className="p-4 rounded-lg bg-background-tertiary hover:bg-[var(--glass-bg)] transition-colors text-2xl"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="h-14 bg-background-secondary border-b border-[var(--glass-border)] flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <button className="btn-secondary text-sm py-2 px-3">↩️ Undo</button>
                        <button className="btn-secondary text-sm py-2 px-3">↪️ Redo</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-success flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                            Auto-saved
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/events/${id}/preview`} className="btn-secondary text-sm py-2">
                            👁️ Preview
                        </Link>
                        <button className="btn-primary text-sm py-2">
                            💾 Save
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-[#1a1a24]">
                    <div className="w-[375px] h-[667px] bg-gradient-to-br from-background-secondary to-background rounded-2xl shadow-2xl border border-[var(--glass-border)] flex flex-col items-center justify-center p-8 text-center">
                        <div className="text-6xl mb-4">💒</div>
                        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "serif" }}>
                            We&apos;re Getting Married
                        </h2>
                        <p className="text-foreground-muted mb-4">
                            Ahmad & Alia
                        </p>
                        <div className="my-6 py-4 border-y border-[var(--glass-border)] w-full">
                            <p className="text-sm text-foreground-muted">Save the Date</p>
                            <p className="text-xl font-bold text-primary">15 February 2026</p>
                            <p className="text-sm text-foreground-muted">Dewan PWTC, Kuala Lumpur</p>
                        </div>
                        <button className="btn-primary text-sm">
                            RSVP Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel - Element Settings */}
            <div className="w-64 bg-background-secondary border-l border-[var(--glass-border)] p-4">
                <h3 className="text-sm font-medium text-white mb-4">Element Settings</h3>

                {selectedElement ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-foreground-muted block mb-1">Content</label>
                            <input type="text" className="input-field text-sm" placeholder="Enter text..." />
                        </div>
                        <div>
                            <label className="text-xs text-foreground-muted block mb-1">Font Size</label>
                            <input type="range" min="12" max="72" className="w-full" />
                        </div>
                        <div>
                            <label className="text-xs text-foreground-muted block mb-1">Alignment</label>
                            <div className="flex gap-1">
                                <button className="flex-1 p-2 rounded bg-background-tertiary text-foreground-muted hover:text-white">⬅️</button>
                                <button className="flex-1 p-2 rounded bg-primary text-white">↔️</button>
                                <button className="flex-1 p-2 rounded bg-background-tertiary text-foreground-muted hover:text-white">➡️</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-foreground-muted text-center py-8">
                        Select an element to edit its properties
                    </p>
                )}

                {/* Next Steps */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--glass-border)]">
                    <Link href={`/events/${id}/guests`} className="btn-primary w-full text-center block">
                        Continue to Guests →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export const runtime = 'edge';
