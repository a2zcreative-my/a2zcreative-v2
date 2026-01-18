"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Mail, Clock, CheckCircle2, XCircle, Send, Filter, Calendar, Bell, Users } from "lucide-react";

// Mock RSVP data
const mockRSVPs = [
    { id: 1, name: "Ahmad bin Ali", email: "ahmad@email.com", event: "Wedding Reception", status: "confirmed", pax: 4, respondedAt: "2024-01-15", message: "Can't wait! We'll be there." },
    { id: 2, name: "Siti Nurhaliza", email: "siti@email.com", event: "Wedding Reception", status: "pending", pax: 0, respondedAt: null, message: null },
    { id: 3, name: "Muhammad Haziq", email: "haziq@email.com", event: "Birthday Party", status: "confirmed", pax: 1, respondedAt: "2024-01-14", message: "Happy to attend!" },
    { id: 4, name: "Nurul Izzah", email: "nurul@email.com", event: "Corporate Event", status: "declined", pax: 0, respondedAt: "2024-01-13", message: "Sorry, I have a conflicting schedule." },
    { id: 5, name: "Amirul Hakim", email: "amirul@email.com", event: "Wedding Reception", status: "confirmed", pax: 3, respondedAt: "2024-01-12", message: "Looking forward to it!" },
    { id: 6, name: "Farah Diana", email: "farah@email.com", event: "Birthday Party", status: "pending", pax: 0, respondedAt: null, message: null },
    { id: 7, name: "Zulkifli Rahman", email: "zulkifli@email.com", event: "Wedding Reception", status: "confirmed", pax: 5, respondedAt: "2024-01-11", message: "Bringing the whole family!" },
    { id: 8, name: "Aishah Hasanah", email: "aishah@email.com", event: "Corporate Event", status: "pending", pax: 0, respondedAt: null, message: null },
];

const statusConfig = {
    confirmed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/20", label: "Confirmed" },
    pending: { icon: Clock, color: "text-warning", bg: "bg-warning/20", label: "Pending" },
    declined: { icon: XCircle, color: "text-error", bg: "bg-error/20", label: "Declined" },
};

export default function RSVPPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [sendingReminders, setSendingReminders] = useState(false);
    const [remindersSent, setRemindersSent] = useState(false);
    const [emailResults, setEmailResults] = useState<{ sent: number; failed: number; results: { id: number | string; email: string; success: boolean; error?: string }[] } | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);

    const pendingGuests = mockRSVPs.filter(r => r.status === "pending");

    const handleSendReminders = async () => {
        setSendingReminders(true);
        setSendError(null);

        try {
            const response = await fetch('/api/reminders/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guests: pendingGuests.map(g => ({
                        id: g.id,
                        name: g.name,
                        email: g.email,
                        event: g.event
                    }))
                })
            });

            const data = await response.json();

            if (response.ok) {
                setEmailResults({ sent: data.sent, failed: data.failed, results: data.results });
                setRemindersSent(true);
            } else {
                setSendError(data.error || 'Failed to send reminders');
            }
        } catch (err) {
            setSendError(err instanceof Error ? err.message : 'Network error');
        } finally {
            setSendingReminders(false);
        }
    };

    const filteredRSVPs = mockRSVPs.filter(rsvp => {
        const matchesSearch = rsvp.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || rsvp.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: mockRSVPs.length,
        confirmed: mockRSVPs.filter(r => r.status === "confirmed").length,
        pending: mockRSVPs.filter(r => r.status === "pending").length,
        declined: mockRSVPs.filter(r => r.status === "declined").length,
        totalPax: mockRSVPs.reduce((sum, r) => sum + r.pax, 0),
    };

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">RSVP Tracking</h1>
                        <p className="text-foreground-muted">Track and manage guest responses</p>
                    </div>
                    <button onClick={() => setShowReminderModal(true)} className="btn-primary flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Reminders
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Total Sent</p>
                                <p className="text-xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Confirmed</p>
                                <p className="text-xl font-bold text-success">{stats.confirmed}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Pending</p>
                                <p className="text-xl font-bold text-warning">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-error" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Declined</p>
                                <p className="text-xl font-bold text-error">{stats.declined}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Total Pax</p>
                                <p className="text-xl font-bold text-secondary">{stats.totalPax}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response Rate */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-foreground-muted text-sm">Response Rate</p>
                        <p className="text-white font-medium">{Math.round(((stats.confirmed + stats.declined) / stats.total) * 100)}%</p>
                    </div>
                    <div className="h-3 bg-background-tertiary rounded-full overflow-hidden flex">
                        <div className="h-full bg-success" style={{ width: `${(stats.confirmed / stats.total) * 100}%` }} />
                        <div className="h-full bg-error" style={{ width: `${(stats.declined / stats.total) * 100}%` }} />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-success">● Confirmed</span>
                        <span className="text-error">● Declined</span>
                        <span className="text-foreground-muted">● Pending</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search guests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field w-full"
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-foreground-muted" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                </div>

                {/* RSVP List */}
                <div className="space-y-3">
                    {filteredRSVPs.map((rsvp) => {
                        const config = statusConfig[rsvp.status as keyof typeof statusConfig];
                        const StatusIcon = config.icon;
                        return (
                            <div key={rsvp.id} className="glass-card p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-white">{rsvp.name}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground-muted truncate">{rsvp.event}</p>
                                    {rsvp.message && (
                                        <p className="text-sm text-foreground-muted italic mt-1">&quot;{rsvp.message}&quot;</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    {rsvp.pax > 0 && (
                                        <p className="text-white font-medium">{rsvp.pax} pax</p>
                                    )}
                                    {rsvp.respondedAt && (
                                        <p className="text-xs text-foreground-muted">{rsvp.respondedAt}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Send Reminders Modal */}
            {showReminderModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-lg animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Send Reminders</h2>
                                <p className="text-foreground-muted text-sm">Remind guests who haven&apos;t responded</p>
                            </div>
                        </div>

                        {remindersSent ? (
                            <div className="py-6">
                                <div className="text-center mb-6">
                                    <div className={`w-16 h-16 rounded-full ${emailResults?.failed === 0 ? 'bg-success/20' : 'bg-warning/20'} flex items-center justify-center mx-auto mb-4`}>
                                        {emailResults?.failed === 0 ? (
                                            <CheckCircle2 className="w-8 h-8 text-success" />
                                        ) : (
                                            <Bell className="w-8 h-8 text-warning" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {emailResults?.failed === 0 ? 'All Reminders Sent!' : 'Reminders Sent with Issues'}
                                    </h3>
                                    <p className="text-foreground-muted">
                                        {emailResults?.sent} sent{emailResults?.failed ? `, ${emailResults.failed} failed` : ''}
                                    </p>
                                </div>

                                {/* Results list */}
                                {emailResults?.results && (
                                    <div className="glass-card p-4 bg-background-tertiary/50 mb-6 max-h-48 overflow-y-auto">
                                        {emailResults.results.map((result) => (
                                            <div key={result.id} className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-0">
                                                <div className="flex items-center gap-2">
                                                    {result.success ? (
                                                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-error flex-shrink-0" />
                                                    )}
                                                    <span className="text-sm text-white">{result.email}</span>
                                                </div>
                                                {!result.success && result.error && (
                                                    <span className="text-xs text-error">{result.error}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setShowReminderModal(false);
                                        setRemindersSent(false);
                                        setEmailResults(null);
                                    }}
                                    className="btn-primary w-full"
                                >
                                    Done
                                </button>
                            </div>
                        ) : sendError ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-error" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Failed to Send</h3>
                                <p className="text-foreground-muted mb-6">{sendError}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setShowReminderModal(false);
                                            setSendError(null);
                                        }}
                                        className="btn-secondary flex-1"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSendError(null);
                                            handleSendReminders();
                                        }}
                                        className="btn-primary flex-1"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="glass-card p-4 bg-background-tertiary/50 mb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Users className="w-5 h-5 text-warning" />
                                        <p className="text-white font-medium">{stats.pending} Pending Guests</p>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {mockRSVPs.filter(r => r.status === "pending").map(guest => (
                                            <div key={guest.id} className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-0">
                                                <div>
                                                    <p className="text-white text-sm">{guest.name}</p>
                                                    <p className="text-foreground-muted text-xs">{guest.email}</p>
                                                </div>
                                                <span className="text-xs text-foreground-muted">{guest.event}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-foreground-muted text-sm mb-6">
                                    A reminder email will be sent to all pending guests asking them to RSVP.
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowReminderModal(false)}
                                        className="btn-secondary flex-1"
                                        disabled={sendingReminders}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendReminders}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                        disabled={sendingReminders}
                                    >
                                        {sendingReminders ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send to {stats.pending} Guests
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
