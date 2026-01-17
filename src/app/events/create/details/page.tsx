"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Check, UserRound, Loader2, X, Heart } from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function EventDetailsContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan") || "starter";
    const eventType = searchParams.get("type") || "Event";

    const [formData, setFormData] = useState({
        eventName: "",
        date: "",
        time: "",
        venue: "",
        address: "",
        hostName: "",
        coupleName1: "",
        coupleName2: "",
        celebrantName: "",
        companyName: "",
        description: "",
    });

    // Photo upload states
    const [bridePhoto, setBridePhoto] = useState<string | null>(null);
    const [groomPhoto, setGroomPhoto] = useState<string | null>(null);
    const [celebrantPhoto, setCelebrantPhoto] = useState<string | null>(null);
    const [babyPhoto, setBabyPhoto] = useState<string | null>(null);
    const [logoPhoto, setLogoPhoto] = useState<string | null>(null);
    const [hostPhoto, setHostPhoto] = useState<string | null>(null);
    const [uploading, setUploading] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Event type detection
    const isWedding = eventType.toLowerCase().includes("wedding") || eventType.toLowerCase().includes("nikah") || eventType.toLowerCase().includes("engagement");
    const isBirthday = eventType.toLowerCase().includes("birthday") || eventType.toLowerCase().includes("surprise");
    const isBabyEvent = eventType.toLowerCase().includes("baby") || eventType.toLowerCase().includes("aqiqah");
    const isGraduation = eventType.toLowerCase().includes("graduation");
    const isCorporate = eventType.toLowerCase().includes("corporate") || eventType.toLowerCase().includes("seminar") || eventType.toLowerCase().includes("conference") || eventType.toLowerCase().includes("summit") || eventType.toLowerCase().includes("product launch") || eventType.toLowerCase().includes("annual dinner") || eventType.toLowerCase().includes("award") || eventType.toLowerCase().includes("government");
    const isFamilyEvent = eventType.toLowerCase().includes("family") || eventType.toLowerCase().includes("reunion") || eventType.toLowerCase().includes("housewarming") || eventType.toLowerCase().includes("kenduri") || eventType.toLowerCase().includes("religious") || eventType.toLowerCase().includes("ceramah") || eventType.toLowerCase().includes("gala") || eventType.toLowerCase().includes("invite-only");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = async (file: File, type: string) => {
        if (file.size > MAX_FILE_SIZE) {
            setUploadError("File must be under 2MB");
            return;
        }
        if (!file.type.startsWith("image/")) {
            setUploadError("Please upload an image file");
            return;
        }

        setUploading(type);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", `events/new/${type}`);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Upload failed");

            // Set the appropriate photo based on type
            switch (type) {
                case "bride": setBridePhoto(result.url); break;
                case "groom": setGroomPhoto(result.url); break;
                case "celebrant": setCelebrantPhoto(result.url); break;
                case "baby": setBabyPhoto(result.url); break;
                case "logo": setLogoPhoto(result.url); break;
                case "host": setHostPhoto(result.url); break;
            }
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setUploading(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (file) handlePhotoUpload(file, type);
        e.target.value = "";
    };

    const isFormValid = formData.eventName && formData.date && formData.time && formData.venue;

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white">
                            <Check className="w-4 h-4" />
                        </div>
                        <span className="text-success font-medium">Event Type</span>
                    </div>
                    <div className="flex-1 h-1 mx-4 bg-background-tertiary rounded-full">
                        <div className="h-full w-2/3 bg-gradient-to-r from-primary to-secondary rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                            2
                        </div>
                        <span className="text-white font-medium">Details</span>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="text-center mb-10 animate-fade-in">
                <Link href={`/events/create?plan=${plan}`} className="inline-flex items-center gap-2 text-foreground-muted hover:text-white mb-4">
                    ← Change Event Type
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Event Details
                </h1>
                <p className="text-foreground-muted">
                    Fill in the details for your <span className="text-primary">{eventType}</span>
                </p>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto">
                <div className="glass-card p-8 space-y-6 animate-fade-in">
                    {/* Event Name */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                            Event Name *
                        </label>
                        <input
                            type="text"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            placeholder="e.g., Majlis Perkahwinan Alia & Ahmad"
                            className="input-field"
                        />
                    </div>

                    {/* Wedding Specific: Couple Names */}
                    {isWedding && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        Bride Name
                                    </label>
                                    <input
                                        type="text"
                                        name="coupleName1"
                                        value={formData.coupleName1}
                                        onChange={handleChange}
                                        placeholder="Alia binti Ahmad"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                                        Groom Name
                                    </label>
                                    <input
                                        type="text"
                                        name="coupleName2"
                                        value={formData.coupleName2}
                                        onChange={handleChange}
                                        placeholder="Ahmad bin Ali"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Couple Photos */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-3">
                                    Couple Photos <span className="text-foreground-muted/60">(Optional)</span>
                                </label>

                                {uploadError && (
                                    <div className="p-2 mb-3 bg-error/20 border border-error/30 rounded-lg text-error text-xs flex items-center gap-2">
                                        <X className="w-4 h-4" />
                                        {uploadError}
                                    </div>
                                )}

                                <div className="py-4">
                                    <div className="flex items-center justify-center gap-6">
                                        {/* Bride Photo */}
                                        <div className="text-center">
                                            {bridePhoto ? (
                                                <div className="relative inline-block">
                                                    <Image
                                                        src={bridePhoto}
                                                        alt="Bride"
                                                        width={80}
                                                        height={80}
                                                        className="w-20 h-20 rounded-full object-cover border-2 border-pink-400"
                                                    />
                                                    <button
                                                        onClick={() => setBridePhoto(null)}
                                                        className="absolute -top-1 -right-1 p-1 bg-error rounded-full text-white hover:bg-error/80"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-20 h-20 rounded-full border-2 border-dashed border-pink-400/50 flex items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-400/10 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileSelect(e, "bride")}
                                                        disabled={uploading !== null}
                                                    />
                                                    {uploading === "bride" ? (
                                                        <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                                                    ) : (
                                                        <UserRound className="w-6 h-6 text-pink-400" />
                                                    )}
                                                </label>
                                            )}
                                            <p className="text-xs text-foreground-muted mt-1">Bride</p>
                                        </div>

                                        <Heart className="w-5 h-5 text-red-400" />

                                        {/* Groom Photo */}
                                        <div className="text-center">
                                            {groomPhoto ? (
                                                <div className="relative inline-block">
                                                    <Image
                                                        src={groomPhoto}
                                                        alt="Groom"
                                                        width={80}
                                                        height={80}
                                                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-400"
                                                    />
                                                    <button
                                                        onClick={() => setGroomPhoto(null)}
                                                        className="absolute -top-1 -right-1 p-1 bg-error rounded-full text-white hover:bg-error/80"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-20 h-20 rounded-full border-2 border-dashed border-blue-400/50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-400/10 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileSelect(e, "groom")}
                                                        disabled={uploading !== null}
                                                    />
                                                    {uploading === "groom" ? (
                                                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                                    ) : (
                                                        <UserRound className="w-6 h-6 text-blue-400" />
                                                    )}
                                                </label>
                                            )}
                                            <p className="text-xs text-foreground-muted mt-1">Groom</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-foreground-muted text-center mt-2">Max 2MB • JPG, PNG, WebP</p>
                            </div>
                        </>
                    )}

                    {/* Birthday Specific: Celebrant Name + Photo */}
                    {isBirthday && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Celebrant Name
                                </label>
                                <input
                                    type="text"
                                    name="celebrantName"
                                    value={formData.celebrantName}
                                    onChange={handleChange}
                                    placeholder="Name of the birthday person"
                                    className="input-field"
                                />
                            </div>
                            {/* Celebrant Photo */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-3">
                                    Celebrant Photo <span className="text-foreground-muted/60">(Optional)</span>
                                </label>
                                <div className="flex justify-center py-4">
                                    <div className="text-center">
                                        {celebrantPhoto ? (
                                            <div className="relative inline-block">
                                                <Image src={celebrantPhoto} alt="Celebrant" width={96} height={96} className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
                                                <button onClick={() => setCelebrantPhoto(null)} className="absolute -top-1 -right-1 p-1 bg-error rounded-full text-white hover:bg-error/80"><X className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <label className="w-24 h-24 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors">
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "celebrant")} disabled={uploading !== null} />
                                                {uploading === "celebrant" ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <UserRound className="w-8 h-8 text-primary" />}
                                            </label>
                                        )}
                                        <p className="text-xs text-foreground-muted mt-2">Birthday Person</p>
                                    </div>
                                </div>
                                <p className="text-xs text-foreground-muted text-center">Max 2MB • JPG, PNG, WebP</p>
                            </div>
                        </>
                    )}

                    {/* Corporate Specific: Company Name + Logo */}
                    {isCorporate && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">
                                    Company / Organization
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Company name"
                                    className="input-field"
                                />
                            </div>
                            {/* Organization Logo */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-3">
                                    Organization Logo <span className="text-foreground-muted/60">(Optional)</span>
                                </label>
                                <div className="flex justify-center py-4">
                                    <div className="text-center">
                                        {logoPhoto ? (
                                            <div className="relative inline-block">
                                                <Image src={logoPhoto} alt="Logo" width={96} height={96} className="w-24 h-24 rounded-xl object-contain border-2 border-secondary bg-white p-2" />
                                                <button onClick={() => setLogoPhoto(null)} className="absolute -top-1 -right-1 p-1 bg-error rounded-full text-white hover:bg-error/80"><X className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-secondary/50 flex items-center justify-center cursor-pointer hover:border-secondary hover:bg-secondary/10 transition-colors">
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "logo")} disabled={uploading !== null} />
                                                {uploading === "logo" ? <Loader2 className="w-8 h-8 text-secondary animate-spin" /> : <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                            </label>
                                        )}
                                        <p className="text-xs text-foreground-muted mt-2">Company Logo</p>
                                    </div>
                                </div>
                                <p className="text-xs text-foreground-muted text-center">Max 2MB • JPG, PNG, WebP</p>
                            </div>
                        </>
                    )}

                    {/* Baby Shower / Aqiqah: Baby Photo */}
                    {isBabyEvent && (
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-3">
                                Baby Photo <span className="text-foreground-muted/60">(Optional)</span>
                            </label>
                            <div className="flex justify-center py-4">
                                <div className="text-center">
                                    {babyPhoto ? (
                                        <div className="relative inline-block">
                                            <Image src={babyPhoto} alt="Baby" width={96} height={96} className="w-24 h-24 rounded-full object-cover border-2 border-pink-300" />
                                            <button onClick={() => setBabyPhoto(null)} className="absolute -top-1 -right-1 p-1 bg-error rounded-full text-white hover:bg-error/80"><X className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        <label className="w-24 h-24 rounded-full border-2 border-dashed border-pink-300/50 flex items-center justify-center cursor-pointer hover:border-pink-300 hover:bg-pink-300/10 transition-colors">
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "baby")} disabled={uploading !== null} />
                                            {uploading === "baby" ? <Loader2 className="w-8 h-8 text-pink-300 animate-spin" /> : <UserRound className="w-8 h-8 text-pink-300" />}
                                        </label>
                                    )}
                                    <p className="text-xs text-foreground-muted mt-2">Baby Photo</p>
                                </div>
                            </div>
                            <p className="text-xs text-foreground-muted text-center">Max 2MB • JPG, PNG, WebP</p>
                        </div>
                    )}

                    {/* Graduation: Graduate Photo */}
                    {isGraduation && (
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-3">
                                Graduate Photo <span className="text-foreground-muted/60">(Optional)</span>
                            </label>
                            <div className="flex justify-center py-4">
                                <div className="text-center">
                                    {celebrantPhoto ? (
                                        <div className="relative inline-block">
                                            <Image src={celebrantPhoto} alt="Graduate" width={96} height={96} className="w-24 h-24 rounded-full object-cover border-2 border-yellow-500" />
                                            <button onClick={() => setCelebrantPhoto(null)} className="absolute -top-1 -right-1 p-1 bg-error rounded-full text-white hover:bg-error/80"><X className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        <label className="w-24 h-24 rounded-full border-2 border-dashed border-yellow-500/50 flex items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-500/10 transition-colors">
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "celebrant")} disabled={uploading !== null} />
                                            {uploading === "celebrant" ? <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" /> : <UserRound className="w-8 h-8 text-yellow-500" />}
                                        </label>
                                    )}
                                    <p className="text-xs text-foreground-muted mt-2">Graduate</p>
                                </div>
                            </div>
                            <p className="text-xs text-foreground-muted text-center">Max 2MB • JPG, PNG, WebP</p>
                        </div>
                    )}

                    {/* Family Events: Host Photo */}
                    {isFamilyEvent && (
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-3">
                                Host Photo <span className="text-foreground-muted/60">(Optional)</span>
                            </label>
                            <div className="flex justify-center py-4">
                                <div className="text-center">
                                    {hostPhoto ? (
                                        <div className="relative inline-block">
                                            <Image src={hostPhoto} alt="Host" width={96} height={96} className="w-24 h-24 rounded-full object-cover border-2 border-green-400" />
                                            <button onClick={() => setHostPhoto(null)} className="absolute -top-1 -right-1 p-1 bg-error rounded-full text-white hover:bg-error/80"><X className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        <label className="w-24 h-24 rounded-full border-2 border-dashed border-green-400/50 flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-400/10 transition-colors">
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "host")} disabled={uploading !== null} />
                                            {uploading === "host" ? <Loader2 className="w-8 h-8 text-green-400 animate-spin" /> : <UserRound className="w-8 h-8 text-green-400" />}
                                        </label>
                                    )}
                                    <p className="text-xs text-foreground-muted mt-2">Host / Organizer</p>
                                </div>
                            </div>
                            <p className="text-xs text-foreground-muted text-center">Max 2MB • JPG, PNG, WebP</p>
                        </div>
                    )}

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                Time *
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Venue */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                            Venue Name *
                        </label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            placeholder="e.g., Dewan Seri Endon, PWTC"
                            className="input-field"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                            Full Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Full address with postcode"
                            className="input-field"
                        />
                    </div>

                    {/* Host Name */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                            Host Name
                        </label>
                        <input
                            type="text"
                            name="hostName"
                            value={formData.hostName}
                            onChange={handleChange}
                            placeholder="e.g., Encik Ahmad & Puan Fatimah"
                            className="input-field"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-2">
                            Event Description (Optional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description or special notes about your event"
                            rows={3}
                            className="input-field resize-none"
                        />
                    </div>
                </div>

                {/* Continue Button */}
                <div className="mt-6 flex gap-4">
                    <Link
                        href={`/events/create?plan=${plan}`}
                        className="btn-secondary flex-1 text-center"
                    >
                        ← Back
                    </Link>
                    <Link
                        href={isFormValid ? `/events/new/template?plan=${plan}&type=${encodeURIComponent(eventType)}` : "#"}
                        className={`btn-primary flex-1 text-center ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={(e) => !isFormValid && e.preventDefault()}
                    >
                        Continue to Templates →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function EventDetailsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <EventDetailsContent />
        </Suspense>
    );
}
