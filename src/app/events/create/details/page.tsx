"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

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

    const isWedding = eventType.toLowerCase().includes("wedding") || eventType.toLowerCase().includes("nikah");
    const isBirthday = eventType.toLowerCase().includes("birthday");
    const isCorporate = eventType.toLowerCase().includes("corporate") || eventType.toLowerCase().includes("seminar") || eventType.toLowerCase().includes("conference");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isFormValid = formData.eventName && formData.date && formData.time && formData.venue;

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white font-bold text-sm">
                            ✓
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
                        <div className="grid grid-cols-2 gap-4">
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
                    )}

                    {/* Birthday Specific: Celebrant Name */}
                    {isBirthday && (
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
                    )}

                    {/* Corporate Specific: Company Name */}
                    {isCorporate && (
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
