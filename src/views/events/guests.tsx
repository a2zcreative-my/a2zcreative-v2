import { useParams } from 'next/navigation';
"use client";

import Link from "next/link";
import { useState, use } from "react";
import StepIndicator from "@/components/StepIndicator";

const mockGuests = [
    { id: "1", name: "Ahmad bin Ali", email: "ahmad@email.com", phone: "+60123456789", status: "confirmed", pax: 4 },
    { id: "2", name: "Siti binti Hassan", email: "siti@email.com", phone: "+60198765432", status: "pending", pax: 2 },
    { id: "3", name: "Tan Wei Ming", email: "weiming@email.com", phone: "+60112223333", status: "confirmed", pax: 3 },
    { id: "4", name: "Raj Kumar", email: "raj@email.com", phone: "+60134445555", status: "declined", pax: 0 },
    { id: "5", name: "Fatimah binti Osman", email: "fatimah@email.com", phone: "+60156667777", status: "pending", pax: 5 },
];

const groups = ["All", "VIP", "Family", "Friends", "Colleagues"];

export default function GuestsPage() {
    const params = useParams(); const id = params?.id as string;
    const [guests, setGuests] = useState(mockGuests);
    const [selectedGroup, setSelectedGroup] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

    const filteredGuests = guests.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: guests.length,
        confirmed: guests.filter(g => g.status === "confirmed").length,
        pending: guests.filter(g => g.status === "pending").length,
        declined: guests.filter(g => g.status === "declined").length,
        totalPax: guests.reduce((sum, g) => sum + g.pax, 0),
    };

    const toggleSelect = (guestId: string) => {
        setSelectedGuests(prev =>
            prev.includes(guestId)
                ? prev.filter(id => id !== guestId)
                : [...prev, guestId]
        );
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={8} eventId={id} />

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <Link href={`/events/${id}/gift`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    ← Back to Gift Details
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Guest Management</h1>
                        <p className="text-foreground-muted">Manage your event attendees</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary">
                            📤 Import CSV
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="btn-primary">
                            ➕ Add Guest
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-foreground-muted">Total Guests</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
                    <p className="text-sm text-foreground-muted">Confirmed</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                    <p className="text-sm text-foreground-muted">Pending</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-error">{stats.declined}</p>
                    <p className="text-sm text-foreground-muted">Declined</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{stats.totalPax}</p>
                    <p className="text-sm text-foreground-muted">Total Pax</p>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-6xl mx-auto mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search guests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div className="flex gap-2">
                    {groups.map((group) => (
                        <button
                            key={group}
                            onClick={() => setSelectedGroup(group)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${selectedGroup === group
                                ? "bg-primary text-white"
                                : "bg-background-tertiary text-foreground-muted hover:text-white"
                                }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </div>

            {/* Guest Table */}
            <div className="max-w-6xl mx-auto glass-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--glass-border)]">
                            <th className="p-4 text-left">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedGuests(guests.map(g => g.id));
                                        } else {
                                            setSelectedGuests([]);
                                        }
                                    }}
                                />
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-foreground-muted">Name</th>
                            <th className="p-4 text-left text-sm font-medium text-foreground-muted">Email</th>
                            <th className="p-4 text-left text-sm font-medium text-foreground-muted">Phone</th>
                            <th className="p-4 text-left text-sm font-medium text-foreground-muted">Status</th>
                            <th className="p-4 text-left text-sm font-medium text-foreground-muted">Pax</th>
                            <th className="p-4 text-left text-sm font-medium text-foreground-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGuests.map((guest) => (
                            <tr key={guest.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)]">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded"
                                        checked={selectedGuests.includes(guest.id)}
                                        onChange={() => toggleSelect(guest.id)}
                                    />
                                </td>
                                <td className="p-4">
                                    <span className="text-white font-medium">{guest.name}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-foreground-muted text-sm">{guest.email}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-foreground-muted text-sm">{guest.phone}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${guest.status === "confirmed" ? "bg-success/20 text-success" :
                                        guest.status === "pending" ? "bg-warning/20 text-warning" :
                                            "bg-error/20 text-error"
                                        }`}>
                                        {guest.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-white">{guest.pax}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button className="text-foreground-muted hover:text-white text-sm">✏️</button>
                                        <button className="text-foreground-muted hover:text-error text-sm">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Batch Actions */}
            {selectedGuests.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-secondary/90 backdrop-blur-xl border-t border-[var(--glass-border)]">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <p className="text-white">
                            {selectedGuests.length} guest(s) selected
                        </p>
                        <div className="flex gap-2">
                            <button className="btn-secondary text-sm">
                                📧 Send Invite
                            </button>
                            <button className="btn-secondary text-sm text-error">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Continue Button (when no batch selection) */}
            {selectedGuests.length === 0 && (
                <div className="max-w-6xl mx-auto mt-6 flex justify-end">
                    <Link href={`/events/${id}/preview`} className="btn-primary">
                        Continue to Preview →
                    </Link>
                </div>
            )}

            {/* Add Guest Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md animate-fade-in">
                        <h2 className="text-xl font-bold text-white mb-4">Add New Guest</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Full Name *</label>
                                <input type="text" className="input-field" placeholder="Guest name" />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Email</label>
                                <input type="email" className="input-field" placeholder="email@example.com" />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Phone</label>
                                <input type="tel" className="input-field" placeholder="+60..." />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Group</label>
                                <select className="input-field">
                                    <option>Select group</option>
                                    <option>VIP</option>
                                    <option>Family</option>
                                    <option>Friends</option>
                                    <option>Colleagues</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                                Cancel
                            </button>
                            <button className="btn-primary flex-1">
                                Add Guest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


