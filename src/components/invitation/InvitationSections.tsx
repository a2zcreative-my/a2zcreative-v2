"use client";

import { useState } from "react";
import {
    Heart,
    Calendar,
    Clock,
    MapPin,
    Navigation,
    Send,
    Users,
    CheckCircle,
    XCircle,
    ChevronDown,
    Sparkles,
    MessageSquare
} from "lucide-react";

interface InvitationData {
    couple: { name1: string; name2: string };
    eventType: string;
    date: string;
    time: string;
    parents: {
        bride: { father: string; mother: string };
        groom: { father: string; mother: string };
    };
    itinerary: Array<{ time: string; event: string }>;
    venue: {
        name: string;
        address: string;
        googleMapsUrl: string;
        wazeUrl: string;
        embedUrl: string;
    };
    theme: { primary: string; secondary: string };
}

interface InvitationSectionsProps {
    data: InvitationData;
}

export default function InvitationSections({ data }: InvitationSectionsProps) {
    const [wishes, setWishes] = useState<Array<{ name: string; message: string }>>([
        { name: "Auntie Salmah", message: "Selamat Pengantin Baru! Semoga bahagia ke anak cucu 💕" },
        { name: "Cousin Hafiz", message: "Congrats bro! Finally! 😂🎉" },
        { name: "Kak Lina", message: "May Allah bless your marriage. Barakallahu lakuma!" },
    ]);
    const [newWish, setNewWish] = useState({ name: "", message: "" });
    const [rsvpData, setRsvpData] = useState({ name: "", phone: "", pax: 1, attending: "yes" });
    const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

    const handleWishSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWish.name && newWish.message) {
            setWishes([{ ...newWish }, ...wishes]);
            setNewWish({ name: "", message: "" });
        }
    };

    const handleRsvpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("RSVP submitted:", rsvpData);
        setRsvpSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Section 1: Hero - Client Details */}
            <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-5">
                    <Heart className="absolute top-20 left-10 w-48 h-48 text-primary" />
                    <Sparkles className="absolute bottom-20 right-10 w-48 h-48 text-secondary" />
                </div>

                <div className="relative z-10 animate-fade-in">
                    <p className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: data.theme.primary }}>
                        {data.eventType}
                    </p>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-2" style={{ fontFamily: 'serif' }}>
                        {data.couple.name1}
                    </h1>
                    <div className="flex items-center justify-center my-4">
                        <div className="w-12 h-0.5 bg-primary/30" />
                        <Heart className="w-8 h-8 mx-4 text-primary" />
                        <div className="w-12 h-0.5 bg-primary/30" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8" style={{ fontFamily: 'serif' }}>
                        {data.couple.name2}
                    </h1>

                    <div className="glass-card inline-flex items-center gap-6 px-8 py-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <span className="text-white font-semibold">{data.date}</span>
                        </div>
                        <div className="w-px h-6 bg-[var(--glass-border)]" />
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <span className="text-foreground-muted">{data.time}</span>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <p className="text-foreground-muted text-sm mb-2">Scroll Down</p>
                    <ChevronDown className="w-6 h-6 text-primary animate-bounce" />
                </div>
            </section>

            {/* Section 2: Parents */}
            <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-2xl mx-auto animate-fade-in">
                    <p className="text-sm uppercase tracking-[0.2em] text-foreground-muted mb-6">
                        Dengan Hormatnya
                    </p>

                    {/* Bride's Parents */}
                    <div className="mb-12">
                        <p className="text-foreground-muted mb-2">Keluarga Pengantin Perempuan</p>
                        <p className="text-xl text-white font-semibold">{data.parents.bride.father}</p>
                        <p className="text-foreground-muted">&</p>
                        <p className="text-xl text-white font-semibold">{data.parents.bride.mother}</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 my-8">
                        <div className="w-12 h-0.5 bg-primary/30" />
                        <Heart className="w-6 h-6 text-primary" fill="currentColor" />
                        <div className="w-12 h-0.5 bg-primary/30" />
                    </div>

                    {/* Groom's Parents */}
                    <div>
                        <p className="text-foreground-muted mb-2">Keluarga Pengantin Lelaki</p>
                        <p className="text-xl text-white font-semibold">{data.parents.groom.father}</p>
                        <p className="text-foreground-muted">&</p>
                        <p className="text-xl text-white font-semibold">{data.parents.groom.mother}</p>
                    </div>

                    <p className="mt-12 text-foreground-muted text-sm">
                        Mempersilakan hadirin ke majlis perkahwinan putera dan puteri kami
                    </p>
                </div>
            </section>

            {/* Section 3: Itinerary */}
            <section className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Clock className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-white">Aturcara Majlis</h2>
                    </div>
                    <p className="text-foreground-muted text-center mb-8">Event Timeline</p>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary/30" />

                        {/* Timeline Items */}
                        {data.itinerary.map((item, index) => (
                            <div key={index} className="relative flex gap-6 mb-6">
                                {/* Dot */}
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold z-10 shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${data.theme.primary}, ${data.theme.secondary})` }}
                                >
                                    {index + 1}
                                </div>
                                {/* Content */}
                                <div className="glass-card p-4 flex-1">
                                    <p className="text-sm font-semibold" style={{ color: data.theme.primary }}>{item.time}</p>
                                    <p className="text-white">{item.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 4: Location */}
            <section id="location-section" className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl w-full mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <MapPin className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-white">Lokasi Majlis</h2>
                    </div>
                    <p className="text-foreground-muted text-center mb-8">Venue Location</p>

                    {/* Map Embed */}
                    <div className="glass-card overflow-hidden mb-6 rounded-2xl">
                        <iframe
                            src={data.venue.embedUrl}
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full"
                        />
                    </div>

                    {/* Venue Details */}
                    <div className="glass-card p-6 mb-6 text-center">
                        <p className="text-xl font-semibold text-white mb-2">{data.venue.name}</p>
                        <p className="text-foreground-muted">{data.venue.address}</p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <a
                            href={data.venue.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary flex items-center justify-center gap-2"
                        >
                            <MapPin className="w-5 h-5" />
                            <span>Google Maps</span>
                        </a>
                        <a
                            href={data.venue.wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary flex items-center justify-center gap-2"
                        >
                            <Navigation className="w-5 h-5" />
                            <span>Waze</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Section 5: Guest Wishes */}
            <section className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl w-full mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-white">Ucapan & Doa</h2>
                    </div>
                    <p className="text-foreground-muted text-center mb-8">Guest Wishes</p>

                    {/* Add Wish Form */}
                    <form onSubmit={handleWishSubmit} className="glass-card p-6 mb-8">
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Your name"
                                value={newWish.name}
                                onChange={(e) => setNewWish({ ...newWish, name: e.target.value })}
                                className="input-field"
                                required
                            />
                            <textarea
                                placeholder="Write your wishes..."
                                value={newWish.message}
                                onChange={(e) => setNewWish({ ...newWish, message: e.target.value })}
                                className="input-field resize-none h-24"
                                required
                            />
                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" />
                                <span>Send Wishes</span>
                            </button>
                        </div>
                    </form>

                    {/* Wishes List */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {wishes.map((wish, index) => (
                            <div key={index} className="glass-card p-4">
                                <p className="text-white font-semibold mb-1">{wish.name}</p>
                                <p className="text-foreground-muted text-sm">{wish.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 6: RSVP */}
            <section id="rsvp-section" className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Users className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-white">RSVP</h2>
                    </div>
                    <p className="text-foreground-muted text-center mb-8">Confirm Your Attendance</p>

                    {rsvpSubmitted ? (
                        <div className="glass-card p-8 text-center">
                            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
                            <p className="text-foreground-muted">Your attendance has been confirmed.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleRsvpSubmit} className="glass-card p-6 space-y-4">
                            <div>
                                <label className="text-sm text-foreground-muted block mb-2">Your Name</label>
                                <input
                                    type="text"
                                    value={rsvpData.name}
                                    onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={rsvpData.phone}
                                    onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })}
                                    className="input-field"
                                    placeholder="+60123456789"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-2">Will you attend?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRsvpData({ ...rsvpData, attending: "yes" })}
                                        className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${rsvpData.attending === "yes"
                                                ? "border-success bg-success/20 text-success"
                                                : "border-[var(--glass-border)] text-foreground-muted"
                                            }`}
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Yes</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRsvpData({ ...rsvpData, attending: "no" })}
                                        className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${rsvpData.attending === "no"
                                                ? "border-error bg-error/20 text-error"
                                                : "border-[var(--glass-border)] text-foreground-muted"
                                            }`}
                                    >
                                        <XCircle className="w-5 h-5" />
                                        <span>No</span>
                                    </button>
                                </div>
                            </div>
                            {rsvpData.attending === "yes" && (
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-2">Number of guests</label>
                                    <select
                                        value={rsvpData.pax}
                                        onChange={(e) => setRsvpData({ ...rsvpData, pax: parseInt(e.target.value) })}
                                        className="input-field"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                            <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button type="submit" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" />
                                <span>Confirm Attendance</span>
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* Section 7: Footer */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-md mx-auto">
                    <Heart className="w-10 h-10 text-primary mx-auto mb-4" fill="currentColor" />
                    <p className="text-foreground-muted mb-2">We look forward to celebrating with you!</p>
                    <p className="text-sm text-foreground-muted/50 mb-8">
                        #{data.couple.name1}{data.couple.name2}2026
                    </p>

                    <div className="w-16 h-0.5 mx-auto mb-6 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <p className="text-xs text-foreground-muted/30">
                        Powered by
                    </p>
                    <p className="text-sm font-semibold" style={{ color: data.theme.primary }}>
                        A2Z Creative
                    </p>
                </div>
            </section>

            {/* Gift Section Hidden Anchor */}
            <section id="gift-section" className="hidden" />
        </div>
    );
}
