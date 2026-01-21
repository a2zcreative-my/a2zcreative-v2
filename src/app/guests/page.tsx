"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useRef, useEffect } from "react";
import { Search, Plus, Upload, MoreVertical, Mail, Phone, Check, X, Filter, FileSpreadsheet, UserPlus, Loader2, Users, Download, Send, Bell, Heart } from "lucide-react";

interface Guest {
    id: string | number;
    name: string;
    email: string;
    phone: string;
    event: string;
    status: string;
    pax: number;
}

interface EventOption {
    id: string;
    name: string;
}

const statusColors: Record<string, string> = {
    confirmed: "bg-success/20 text-success",
    pending: "bg-warning/20 text-warning",
    declined: "bg-error/20 text-error",
};

export default function GuestsPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [events, setEvents] = useState<EventOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterEvent, setFilterEvent] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageType, setMessageType] = useState<'reminder' | 'thankyou' | 'custom'>('reminder');
    const [customSubject, setCustomSubject] = useState("");
    const [customMessage, setCustomMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
    const [newGuest, setNewGuest] = useState({ name: "", email: "", phone: "", eventId: "", pax: 1 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchGuests() {
            try {
                const response = await fetch('/api/client/guests');
                if (response.ok) {
                    const data = await response.json();
                    setGuests(data.guests || []);
                    setEvents(data.events || []);
                }
            } catch (error) {
                console.error('Failed to fetch guests:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchGuests();
    }, []);

    const filteredGuests = guests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guest.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesEvent = filterEvent === "all" || guest.event === filterEvent;
        return matchesSearch && matchesEvent;
    });

    const eventNames = [...new Set(guests.map(g => g.event))];

    const handleAddGuest = () => {
        if (!newGuest.name.trim()) return;
        const guest: Guest = {
            id: Date.now(),
            name: newGuest.name,
            email: newGuest.email,
            phone: newGuest.phone,
            event: events.find(e => e.id === newGuest.eventId)?.name || "Uncategorized",
            status: "pending",
            pax: newGuest.pax,
        };
        setGuests(prev => [...prev, guest]);
        setNewGuest({ name: "", email: "", phone: "", eventId: "", pax: 1 });
        setShowAddModal(false);
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const newGuests = lines.slice(1).map((line, index) => {
                const values = line.split(',').map(v => v.trim());
                const nameIdx = headers.findIndex(h => h.includes('name'));
                const emailIdx = headers.findIndex(h => h.includes('email'));
                const phoneIdx = headers.findIndex(h => h.includes('phone'));
                const eventIdx = headers.findIndex(h => h.includes('event'));
                const paxIdx = headers.findIndex(h => h.includes('pax') || h.includes('guest'));

                return {
                    id: Date.now() + index,
                    name: nameIdx >= 0 ? values[nameIdx] : `Guest ${index + 1}`,
                    email: emailIdx >= 0 ? values[emailIdx] : "",
                    phone: phoneIdx >= 0 ? values[phoneIdx] : "",
                    event: eventIdx >= 0 ? values[eventIdx] : "Imported",
                    status: "pending" as const,
                    pax: paxIdx >= 0 ? parseInt(values[paxIdx]) || 1 : 1,
                };
            }).filter(g => g.name);

            setGuests(prev => [...prev, ...newGuests]);
            setShowImportModal(false);
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };

    const handleSendMessage = async () => {
        // Get guests to message based on filter
        const guestsToMessage = filteredGuests.filter(g => g.email && g.email.includes('@'));

        if (guestsToMessage.length === 0) {
            setSendResult({ success: false, message: 'No guests with valid email addresses found' });
            return;
        }

        setIsSending(true);
        setSendResult(null);

        try {
            const response = await fetch('/api/client/guests/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guests: guestsToMessage.map(g => ({
                        id: g.id.toString(),
                        name: g.name,
                        email: g.email,
                        event: g.event
                    })),
                    messageType,
                    subject: customSubject,
                    customMessage,
                    eventName: filterEvent !== 'all' ? filterEvent : undefined
                })
            });

            const data = await response.json();
            setSendResult({
                success: data.success,
                message: data.message || (data.success ? 'Messages sent!' : 'Failed to send messages')
            });

            if (data.success) {
                setTimeout(() => {
                    setShowMessageModal(false);
                    setSendResult(null);
                    setCustomSubject("");
                    setCustomMessage("");
                }, 2000);
            }
        } catch (error) {
            setSendResult({ success: false, message: 'Failed to send messages' });
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Guest Management</h1>
                            <p className="text-foreground-muted">Manage guests across all your events</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Guest Management</h1>
                        <p className="text-foreground-muted">Manage guests across all your events</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowMessageModal(true)}
                            className="btn-secondary flex items-center gap-2"
                            disabled={filteredGuests.filter(g => g.email).length === 0}
                        >
                            <Send className="w-4 h-4" />
                            Send Message
                        </button>
                        <a
                            href="/api/client/guests/export"
                            download
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </a>
                        <button onClick={() => setShowImportModal(true)} className="btn-secondary flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Import CSV
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Guest
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4">
                        <p className="text-foreground-muted text-sm">Total Guests</p>
                        <p className="text-2xl font-bold text-white">{guests.length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-foreground-muted text-sm">Confirmed</p>
                        <p className="text-2xl font-bold text-success">{guests.filter(g => g.status === "confirmed").length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-foreground-muted text-sm">Pending</p>
                        <p className="text-2xl font-bold text-warning">{guests.filter(g => g.status === "pending").length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-foreground-muted text-sm">Total Pax</p>
                        <p className="text-2xl font-bold text-primary">{guests.reduce((sum, g) => sum + g.pax, 0)}</p>
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
                            value={filterEvent}
                            onChange={(e) => setFilterEvent(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Events</option>
                            {eventNames.map(eventName => (
                                <option key={eventName} value={eventName}>{eventName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Guest List */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-[var(--glass-border)]">
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Name</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Contact</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Event</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Status</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Pax</th>
                                    <th className="p-4 text-left text-sm font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGuests.map((guest) => (
                                    <tr key={guest.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)]">
                                        <td className="p-4">
                                            <p className="font-medium text-white">{guest.name}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-foreground-muted flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {guest.email}
                                                </span>
                                                <span className="text-sm text-foreground-muted flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {guest.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-foreground">{guest.event}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[guest.status as keyof typeof statusColors]}`}>
                                                {guest.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-foreground">{guest.pax}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 rounded-lg hover:bg-success/20 text-success" title="Confirm">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-error/20 text-error" title="Decline">
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-[var(--glass-bg)] text-foreground-muted">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Guest Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Add New Guest</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    className="input-field w-full"
                                    placeholder="Guest name"
                                    value={newGuest.name}
                                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Email</label>
                                <input
                                    type="email"
                                    className="input-field w-full"
                                    placeholder="email@example.com"
                                    value={newGuest.email}
                                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="input-field w-full"
                                    placeholder="+60..."
                                    value={newGuest.phone}
                                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Event</label>
                                    <select
                                        className="input-field w-full"
                                        value={newGuest.eventId}
                                        onChange={(e) => setNewGuest({ ...newGuest, eventId: e.target.value })}
                                    >
                                        <option value="">Select event</option>
                                        {events.map(event => (
                                            <option key={event.id} value={event.id}>{event.name}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Pax</label>
                                    <input
                                        type="number"
                                        className="input-field w-full"
                                        min="1"
                                        value={newGuest.pax}
                                        onChange={(e) => setNewGuest({ ...newGuest, pax: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewGuest({ name: "", email: "", phone: "", eventId: "", pax: 1 });
                                }}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button onClick={handleAddGuest} className="btn-primary flex-1">
                                Add Guest
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import CSV Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                                <FileSpreadsheet className="w-5 h-5 text-secondary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Import Guests from CSV</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-[var(--glass-border)] rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                                <Upload className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                                <p className="text-white font-medium mb-2">Drop your CSV file here</p>
                                <p className="text-foreground-muted text-sm mb-4">or click to browse</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".csv"
                                    onChange={handleImportCSV}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn-secondary"
                                >
                                    Choose File
                                </button>
                            </div>
                            <div className="glass-card p-4 bg-background-tertiary/50">
                                <p className="text-sm text-foreground-muted mb-2">CSV Format:</p>
                                <code className="text-xs text-primary">name, email, phone, event, pax</code>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setShowImportModal(false)} className="btn-secondary flex-1">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Send className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Send Message</h2>
                                <p className="text-sm text-foreground-muted">
                                    To {filteredGuests.filter(g => g.email).length} guest(s) with email
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Message Type Selection */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-2">Message Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setMessageType('reminder')}
                                        className={`p-3 rounded-xl border text-center transition-all ${messageType === 'reminder'
                                                ? 'border-primary bg-primary/20 text-white'
                                                : 'border-[var(--glass-border)] text-foreground-muted hover:bg-[var(--glass-bg)]'
                                            }`}
                                    >
                                        <Bell className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-xs">Reminder</span>
                                    </button>
                                    <button
                                        onClick={() => setMessageType('thankyou')}
                                        className={`p-3 rounded-xl border text-center transition-all ${messageType === 'thankyou'
                                                ? 'border-success bg-success/20 text-white'
                                                : 'border-[var(--glass-border)] text-foreground-muted hover:bg-[var(--glass-bg)]'
                                            }`}
                                    >
                                        <Heart className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-xs">Thank You</span>
                                    </button>
                                    <button
                                        onClick={() => setMessageType('custom')}
                                        className={`p-3 rounded-xl border text-center transition-all ${messageType === 'custom'
                                                ? 'border-secondary bg-secondary/20 text-white'
                                                : 'border-[var(--glass-border)] text-foreground-muted hover:bg-[var(--glass-bg)]'
                                            }`}
                                    >
                                        <Mail className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-xs">Custom</span>
                                    </button>
                                </div>
                            </div>

                            {/* Custom message fields */}
                            {messageType === 'custom' && (
                                <>
                                    <div>
                                        <label className="text-sm text-foreground-muted block mb-1">Subject</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="Email subject"
                                            value={customSubject}
                                            onChange={(e) => setCustomSubject(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-foreground-muted block mb-1">Message</label>
                                        <textarea
                                            className="input-field w-full h-24 resize-none"
                                            placeholder="Your message..."
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Template preview */}
                            {messageType !== 'custom' && (
                                <div className="glass-card p-4 bg-background-tertiary/50">
                                    <p className="text-sm text-foreground-muted mb-1">Preview:</p>
                                    <p className="text-xs text-foreground">
                                        {messageType === 'reminder'
                                            ? "📩 Reminder email asking guests to RSVP"
                                            : "🎉 Thank you email for attending the event"
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Result message */}
                            {sendResult && (
                                <div className={`p-3 rounded-xl text-sm ${sendResult.success ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                                    }`}>
                                    {sendResult.message}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setSendResult(null);
                                }}
                                className="btn-secondary flex-1"
                                disabled={isSending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMessage}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                                disabled={isSending || (messageType === 'custom' && (!customSubject || !customMessage))}
                            >
                                {isSending ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Send</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
