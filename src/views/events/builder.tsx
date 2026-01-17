"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState, use } from "react";
import {
    Camera,
    PartyPopper,
    Church,
    Gem,
    Flower2,
    Sparkles,
    Heart,
    Cake,
    Gift,
    Undo2,
    Redo2,
    Eye,
    Save,
    AlignLeft,
    AlignCenter,
    AlignRight,
    UserRound,
    Upload,
    Loader2,
    X,
} from "lucide-react";
import Image from "next/image";

const textStyles = ["Heading", "Subheading", "Body", "Caption"];
const fontFamilies = ["Playfair Display", "Poppins", "Montserrat", "Lora", "Dancing Script"];
const colors = ["#ffffff", "#f59e0b", "#ec4899", "#22c55e", "#3b82f6", "#8b5cf6"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function BuilderPage() {
    const params = useParams(); const id = params?.id as string;
    const [activeTab, setActiveTab] = useState<"text" | "colors" | "photos" | "elements">("text");
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [bridePhoto, setBridePhoto] = useState<string | null>(null);
    const [groomPhoto, setGroomPhoto] = useState<string | null>(null);
    const [uploading, setUploading] = useState<"bride" | "groom" | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handlePhotoUpload = async (file: File, type: "bride" | "groom") => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setUploadError("File must be under 2MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setUploadError("Please upload an image file");
            return;
        }

        setUploading(type);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", `events/${id}/couple`);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Upload failed");
            }

            if (type === "bride") {
                setBridePhoto(result.url);
            } else {
                setGroomPhoto(result.url);
            }
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setUploading(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "bride" | "groom") => {
        const file = e.target.files?.[0];
        if (file) {
            handlePhotoUpload(file, type);
        }
        e.target.value = ""; // Reset input
    };

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
                            <p className="text-xs text-foreground-muted uppercase tracking-wide">Couple Photos</p>

                            {uploadError && (
                                <div className="p-2 bg-error/20 border border-error/30 rounded-lg text-error text-xs flex items-center gap-2">
                                    <X className="w-4 h-4" />
                                    {uploadError}
                                </div>
                            )}

                            {/* Bride Photo */}
                            <div className="space-y-2">
                                <label className="text-sm text-foreground-muted">Bride Photo</label>
                                {bridePhoto ? (
                                    <div className="relative">
                                        <Image
                                            src={bridePhoto}
                                            alt="Bride"
                                            width={200}
                                            height={200}
                                            className="w-full aspect-square rounded-xl object-cover border-2 border-pink-400"
                                        />
                                        <button
                                            onClick={() => setBridePhoto(null)}
                                            className="absolute top-2 right-2 p-1 bg-error/80 rounded-full text-white hover:bg-error"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="block w-full p-4 rounded-lg border-2 border-dashed border-pink-400/50 text-foreground-muted hover:text-pink-400 hover:border-pink-400 transition-colors text-center cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileSelect(e, "bride")}
                                            disabled={uploading !== null}
                                        />
                                        {uploading === "bride" ? (
                                            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-pink-400" />
                                        ) : (
                                            <UserRound className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                                        )}
                                        <span className="text-xs">Upload Bride Photo</span>
                                    </label>
                                )}
                            </div>

                            {/* Groom Photo */}
                            <div className="space-y-2">
                                <label className="text-sm text-foreground-muted">Groom Photo</label>
                                {groomPhoto ? (
                                    <div className="relative">
                                        <Image
                                            src={groomPhoto}
                                            alt="Groom"
                                            width={200}
                                            height={200}
                                            className="w-full aspect-square rounded-xl object-cover border-2 border-blue-400"
                                        />
                                        <button
                                            onClick={() => setGroomPhoto(null)}
                                            className="absolute top-2 right-2 p-1 bg-error/80 rounded-full text-white hover:bg-error"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="block w-full p-4 rounded-lg border-2 border-dashed border-blue-400/50 text-foreground-muted hover:text-blue-400 hover:border-blue-400 transition-colors text-center cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileSelect(e, "groom")}
                                            disabled={uploading !== null}
                                        />
                                        {uploading === "groom" ? (
                                            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-400" />
                                        ) : (
                                            <UserRound className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                                        )}
                                        <span className="text-xs">Upload Groom Photo</span>
                                    </label>
                                )}
                            </div>

                            <p className="text-xs text-foreground-muted text-center">
                                Max 2MB • JPG, PNG, WebP
                            </p>
                        </div>
                    )}

                    {activeTab === "elements" && (
                        <div className="space-y-4">
                            <p className="text-xs text-foreground-muted uppercase tracking-wide mb-2">Add Elements</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: PartyPopper, label: "Party" },
                                    { icon: Church, label: "Venue" },
                                    { icon: Gem, label: "Ring" },
                                    { icon: Flower2, label: "Flower" },
                                    { icon: Sparkles, label: "Sparkle" },
                                    { icon: Heart, label: "Love" },
                                    { icon: Cake, label: "Cake" },
                                    { icon: Gift, label: "Gift" },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.label}
                                            className="p-4 rounded-lg bg-background-tertiary hover:bg-[var(--glass-bg)] transition-colors flex flex-col items-center"
                                        >
                                            <Icon className="w-6 h-6 text-primary" />
                                        </button>
                                    );
                                })}
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
                        <button className="btn-secondary text-sm py-2 px-3 flex items-center gap-1">
                            <Undo2 className="w-4 h-4" /> Undo
                        </button>
                        <button className="btn-secondary text-sm py-2 px-3 flex items-center gap-1">
                            <Redo2 className="w-4 h-4" /> Redo
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-success flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                            Auto-saved
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/events/${id}/preview`} className="btn-secondary text-sm py-2 flex items-center gap-1">
                            <Eye className="w-4 h-4" /> Preview
                        </Link>
                        <button className="btn-primary text-sm py-2 flex items-center gap-1">
                            <Save className="w-4 h-4" /> Save
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-[#1a1a24]">
                    <div className="w-[375px] h-[667px] bg-gradient-to-br from-background-secondary to-background rounded-2xl shadow-2xl border border-[var(--glass-border)] flex flex-col items-center justify-center p-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            {/* Bride */}
                            {bridePhoto ? (
                                <Image
                                    src={bridePhoto}
                                    alt="Bride"
                                    width={56}
                                    height={56}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-pink-400"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center border-2 border-dashed border-pink-400/50">
                                    <UserRound className="w-8 h-8 text-pink-400" />
                                </div>
                            )}

                            <Heart className="w-6 h-6 text-red-400 animate-pulse" />

                            {/* Groom */}
                            {groomPhoto ? (
                                <Image
                                    src={groomPhoto}
                                    alt="Groom"
                                    width={56}
                                    height={56}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-400"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-dashed border-blue-400/50">
                                    <UserRound className="w-8 h-8 text-blue-400" />
                                </div>
                            )}
                        </div>
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
                                <button className="flex-1 p-2 rounded bg-background-tertiary text-foreground-muted hover:text-white flex items-center justify-center">
                                    <AlignLeft className="w-4 h-4" />
                                </button>
                                <button className="flex-1 p-2 rounded bg-primary text-white flex items-center justify-center">
                                    <AlignCenter className="w-4 h-4" />
                                </button>
                                <button className="flex-1 p-2 rounded bg-background-tertiary text-foreground-muted hover:text-white flex items-center justify-center">
                                    <AlignRight className="w-4 h-4" />
                                </button>
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


