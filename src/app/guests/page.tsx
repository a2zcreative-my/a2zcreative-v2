"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Plus, Upload, MoreVertical, Mail, Phone, Check, X, Filter } from "lucide-react";

// Mock guest data
const mockGuests = [
    { id: 1, name: "Ahmad bin Ali", email: "ahmad@email.com", phone: "+60 12-345 6789", event: "Wedding Reception", status: "confirmed", pax: 4 },
    { id: 2, name: "Siti Nurhaliza", email: "siti@email.com", phone: "+60 13-456 7890", event: "Wedding Reception", status: "pending", pax: 2 },
    { id: 3, name: "Muhammad Haziq", email: "haziq@email.com", phone: "+60 14-567 8901", event: "Birthday Party", status: "confirmed", pax: 1 },
    { id: 4, name: "Nurul Izzah", email: "nurul@email.com", phone: "+60 15-678 9012", event: "Corporate Event", status: "declined", pax: 0 },
    { id: 5, name: "Amirul Hakim", email: "amirul@email.com", phone: "+60 16-789 0123", event: "Wedding Reception", status: "confirmed", pax: 3 },
    { id: 6, name: "Farah Diana", email: "farah@email.com", phone: "+60 17-890 1234", event: "Birthday Party", status: "pending", pax: 2 },
    { id: 7, name: "Zulkifli Rahman", email: "zul@email.com", phone: "+60 18-901 2345", event: "Wedding Reception", status: "confirmed", pax: 5 },
    { id: 8, name: "Aishah Hasanah", email: "aishah@email.com", phone: "+60 19-012 3456", event: "Corporate Event", status: "pending", pax: 1 },
];

const statusColors = {
    confirmed: "bg-success/20 text-success",
    pending: "bg-warning/20 text-warning",
    declined: "bg-error/20 text-error",
};

export default function GuestsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterEvent, setFilterEvent] = useState("all");

    const filteredGuests = mockGuests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guest.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesEvent = filterEvent === "all" || guest.event === filterEvent;
        return matchesSearch && matchesEvent;
    });

    const events = [...new Set(mockGuests.map(g => g.event))];

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Guest Management</h1>
                        <p className="text-foreground-muted">Manage guests across all your events</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Import CSV
                        </button>
                        <button className="btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Guest
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4">
                        <p className="text-foreground-muted text-sm">Total Guests</p>
                        <p className="text-2xl font-bold text-white">{mockGuests.length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-foreground-muted text-sm">Confirmed</p>
                        <p className="text-2xl font-bold text-success">{mockGuests.filter(g => g.status === "confirmed").length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-foreground-muted text-sm">Pending</p>
                        <p className="text-2xl font-bold text-warning">{mockGuests.filter(g => g.status === "pending").length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-foreground-muted text-sm">Total Pax</p>
                        <p className="text-2xl font-bold text-primary">{mockGuests.reduce((sum, g) => sum + g.pax, 0)}</p>
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
                            {events.map(event => (
                                <option key={event} value={event}>{event}</option>
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
        </DashboardLayout>
    );
}
