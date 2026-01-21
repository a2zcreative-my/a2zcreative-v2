"use client";

import { useState, useEffect } from "react";
import {
    Megaphone,
    Send,
    Users,
    Clock,
    Filter,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Mail,
} from "lucide-react";

interface Broadcast {
    id: string;
    admin_id: string;
    admin_name: string | null;
    admin_email: string | null;
    subject: string;
    body: string;
    segment: string;
    recipient_count: number;
    status: string;
    created_at: string;
}

const SEGMENTS = [
    { value: "all", label: "All Users", description: "Send to all registered users" },
    { value: "plan:starter", label: "Starter Plan", description: "Users on Starter plan" },
    { value: "plan:basic", label: "Basic Plan", description: "Users on Basic plan" },
    { value: "plan:premium", label: "Premium Plan", description: "Users on Premium plan" },
    { value: "plan:exclusive", label: "Exclusive Plan", description: "Users on Exclusive plan" },
    { value: "active", label: "Active Users", description: "Logged in within 30 days" },
    { value: "inactive", label: "Inactive Users", description: "Not logged in for 30+ days" },
];

export default function AdminBroadcastsPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState<string | null>(null);

    // Form state
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [segment, setSegment] = useState("all");

    // Fetch broadcasts
    const fetchBroadcasts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/admin/broadcasts");
            if (!response.ok) {
                throw new Error("Failed to fetch broadcasts");
            }
            const data = await response.json();
            setBroadcasts(data.broadcasts || []);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    // Send broadcast
    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subject.trim() || !body.trim()) {
            alert("Please fill in both subject and message");
            return;
        }

        if (!confirm(`Send broadcast to "${getSegmentLabel(segment)}"? This action cannot be undone.`)) {
            return;
        }

        setSending(true);
        setSendSuccess(null);

        try {
            const response = await fetch("/api/admin/broadcasts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, body, segment }),
            });

            const data = await response.json();

            if (response.ok) {
                setSendSuccess(data.message);
                setSubject("");
                setBody("");
                setSegment("all");
                await fetchBroadcasts();
            } else {
                alert(data.error || "Failed to send broadcast");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send broadcast");
        } finally {
            setSending(false);
        }
    };

    const getSegmentLabel = (seg: string) => {
        return SEGMENTS.find((s) => s.value === seg)?.label || seg;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleString("en-MY", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Broadcasts
                </h1>
                <p className="text-foreground-muted">
                    Send announcements and emails to user segments
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compose Section */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary" />
                        Compose Broadcast
                    </h2>

                    {sendSuccess && (
                        <div className="mb-4 p-4 bg-success/20 border border-success/50 rounded-xl flex items-center gap-2 text-success">
                            <CheckCircle className="w-5 h-5" />
                            {sendSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                        {/* Segment Selector */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                Audience Segment
                            </label>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                                <select
                                    value={segment}
                                    onChange={(e) => setSegment(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-primary/50"
                                >
                                    {SEGMENTS.map((seg) => (
                                        <option key={seg.value} value={seg.value}>
                                            {seg.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-foreground-muted mt-1">
                                {SEGMENTS.find((s) => s.value === segment)?.description}
                            </p>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter email subject..."
                                className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
                                required
                            />
                        </div>

                        {/* Message Body */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">
                                Message
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write your announcement message..."
                                rows={6}
                                className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50 resize-none"
                                required
                            />
                            <p className="text-xs text-foreground-muted mt-1">
                                Use line breaks to format your message. HTML is supported.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={sending || !subject.trim() || !body.trim()}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Megaphone className="w-5 h-5" />
                                    Send Broadcast
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-secondary" />
                        Broadcast History
                    </h2>

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-error/20 border border-error/50 rounded-xl text-center">
                            <AlertTriangle className="w-6 h-6 text-error mx-auto mb-2" />
                            <p className="text-error text-sm">{error}</p>
                        </div>
                    )}

                    {!loading && !error && broadcasts.length === 0 && (
                        <div className="text-center py-12">
                            <Mail className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                            <p className="text-foreground-muted">No broadcasts sent yet</p>
                            <p className="text-foreground-muted text-sm">
                                Your sent broadcasts will appear here
                            </p>
                        </div>
                    )}

                    {!loading && !error && broadcasts.length > 0 && (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {broadcasts.map((broadcast) => (
                                <div
                                    key={broadcast.id}
                                    className="p-4 bg-background-tertiary/50 rounded-xl"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-medium text-white line-clamp-1">
                                            {broadcast.subject}
                                        </h3>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${broadcast.status === "sent"
                                                    ? "bg-success/20 text-success"
                                                    : "bg-error/20 text-error"
                                                }`}
                                        >
                                            {broadcast.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground-muted line-clamp-2 mb-2">
                                        {broadcast.body}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-foreground-muted">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {broadcast.recipient_count} recipients
                                            </span>
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                                                {getSegmentLabel(broadcast.segment)}
                                            </span>
                                        </div>
                                        <span>{formatDate(broadcast.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
