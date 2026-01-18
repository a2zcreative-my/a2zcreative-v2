"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import dynamic from "next/dynamic";
import { QrCode, Search, UserCheck, Clock, Users, CheckCircle2, Camera, Keyboard, AlertCircle } from "lucide-react";

// Dynamically import QR Scanner (requires browser APIs)
const QrScanner = dynamic(() => import("@/components/QrScanner"), {
    ssr: false,
    loading: () => (
        <div className="glass-card p-8 mb-6 text-center">
            <div className="w-64 h-64 mx-auto rounded-2xl flex items-center justify-center bg-background-tertiary border-2 border-dashed border-[var(--glass-border)]">
                <div className="text-center">
                    <QrCode className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-foreground-muted">Loading scanner...</p>
                </div>
            </div>
        </div>
    ),
});

// Mock check-in data with event field and QR codes
const initialGuests = [
    { id: 1, name: "Ahmad bin Ali", pax: 4, checkedIn: true, checkInTime: "10:30 AM", table: "VIP 1", event: "Wedding Reception", qrCode: "GUEST-001" },
    { id: 2, name: "Amirul Hakim", pax: 3, checkedIn: true, checkInTime: "10:45 AM", table: "A5", event: "Wedding Reception", qrCode: "GUEST-002" },
    { id: 3, name: "Zulkifli Rahman", pax: 5, checkedIn: true, checkInTime: "11:00 AM", table: "B2", event: "Wedding Reception", qrCode: "GUEST-003" },
    { id: 4, name: "Muhammad Haziq", pax: 1, checkedIn: false, checkInTime: null, table: "C8", event: "Birthday Party", qrCode: "GUEST-004" },
    { id: 5, name: "Siti Nurhaliza", pax: 2, checkedIn: false, checkInTime: null, table: "A3", event: "Wedding Reception", qrCode: "GUEST-005" },
    { id: 6, name: "Farah Diana", pax: 2, checkedIn: false, checkInTime: null, table: "B7", event: "Birthday Party", qrCode: "GUEST-006" },
    { id: 7, name: "Nurul Izzah", pax: 3, checkedIn: false, checkInTime: null, table: "C2", event: "Corporate Event", qrCode: "GUEST-007" },
    { id: 8, name: "Aishah Hasanah", pax: 2, checkedIn: false, checkInTime: null, table: "D1", event: "Corporate Event", qrCode: "GUEST-008" },
];

const events = [
    { id: "all", name: "All Events" },
    { id: "wedding", name: "Wedding Reception - Today" },
    { id: "birthday", name: "Birthday Party - Tomorrow" },
    { id: "corporate", name: "Corporate Event - Next Week" },
];

const eventMapping: Record<string, string> = {
    "wedding": "Wedding Reception",
    "birthday": "Birthday Party",
    "corporate": "Corporate Event",
};

export default function CheckInPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [scanMode, setScanMode] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState("all");
    const [guests, setGuests] = useState(initialGuests);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastCheckedIn, setLastCheckedIn] = useState<string | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    // Filter guests by search and event
    const filteredGuests = guests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesEvent = selectedEvent === "all" || guest.event === eventMapping[selectedEvent];
        return matchesSearch && matchesEvent;
    });

    // Stats based on filtered guests (or all if "all" selected)
    const statsGuests = selectedEvent === "all" ? guests : guests.filter(g => g.event === eventMapping[selectedEvent]);
    const stats = {
        total: statsGuests.length,
        checkedIn: statsGuests.filter(g => g.checkedIn).length,
        pending: statsGuests.filter(g => !g.checkedIn).length,
        totalPax: statsGuests.reduce((sum, g) => sum + g.pax, 0),
        checkedInPax: statsGuests.filter(g => g.checkedIn).reduce((sum, g) => sum + g.pax, 0),
    };

    // Handle check-in
    const handleCheckIn = (guestId: number) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        setGuests(prev => prev.map(guest =>
            guest.id === guestId
                ? { ...guest, checkedIn: true, checkInTime: timeString }
                : guest
        ));

        const guest = guests.find(g => g.id === guestId);
        if (guest) {
            setLastCheckedIn(guest.name);
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 2000);
        }
    };

    // Handle QR scan result
    const handleQrScan = (scannedCode: string) => {
        setScanError(null);

        // Find guest by QR code
        const guest = guests.find(g => g.qrCode === scannedCode);

        if (!guest) {
            setScanError(`Unknown QR code: ${scannedCode}`);
            return;
        }

        if (guest.checkedIn) {
            setScanError(`${guest.name} is already checked in`);
            return;
        }

        // Check in the guest
        handleCheckIn(guest.id);
        setScanMode(false); // Switch back to manual mode after successful scan
    };

    return (
        <DashboardLayout>
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Guest Check-In</h1>
                        <p className="text-foreground-muted">Scan QR codes or search guests to check in</p>
                    </div>
                    <select
                        className="input-field max-w-xs"
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                    >
                        {events.map(event => (
                            <option key={event.id} value={event.id}>{event.name}</option>
                        ))}
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Total Guests</p>
                                <p className="text-xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Checked In</p>
                                <p className="text-xl font-bold text-success">{stats.checkedIn}</p>
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
                            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <p className="text-foreground-muted text-xs">Pax Arrived</p>
                                <p className="text-xl font-bold text-secondary">{stats.checkedInPax}/{stats.totalPax}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Check-in Mode Toggle */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <p className="text-foreground-muted text-sm">Check-in Mode:</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setScanMode(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${scanMode ? "bg-primary text-white" : "bg-background-tertiary text-foreground-muted hover:text-white"}`}
                            >
                                <Camera className="w-4 h-4" />
                                QR Scanner
                            </button>
                            <button
                                onClick={() => setScanMode(false)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${!scanMode ? "bg-primary text-white" : "bg-background-tertiary text-foreground-muted hover:text-white"}`}
                            >
                                <Keyboard className="w-4 h-4" />
                                Manual Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scan Error Toast */}
                {scanError && (
                    <div className="glass-card p-4 mb-4 flex items-center gap-3 border-error/30 bg-error/10">
                        <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                        <p className="text-error text-sm flex-1">{scanError}</p>
                        <button onClick={() => setScanError(null)} className="text-error hover:text-white">
                            &times;
                        </button>
                    </div>
                )}

                {/* Scanner or Search */}
                {scanMode ? (
                    <div className="mb-6">
                        <QrScanner
                            onScan={handleQrScan}
                            onError={(err) => setScanError(err)}
                            onClose={() => setScanMode(false)}
                        />
                        <p className="text-center text-foreground-muted text-sm mt-4">
                            <strong>Test QR codes:</strong> GUEST-004, GUEST-005, GUEST-006, GUEST-007, GUEST-008
                        </p>
                    </div>
                ) : (
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search guest name or scan code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field w-full text-lg py-4"
                            style={{ paddingLeft: '3rem' }}
                            autoFocus
                        />
                    </div>
                )}

                {/* Guest List */}
                <div className="space-y-3">
                    {filteredGuests.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <Users className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                            <p className="text-white font-medium">No guests found</p>
                            <p className="text-foreground-muted text-sm">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        filteredGuests.map((guest) => (
                            <div key={guest.id} className={`glass-card p-4 flex items-center gap-4 transition-all ${guest.checkedIn ? "border-success/30" : "hover:border-primary/30"}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${guest.checkedIn ? "bg-success/20" : "bg-background-tertiary"}`}>
                                    {guest.checkedIn ? (
                                        <CheckCircle2 className="w-6 h-6 text-success" />
                                    ) : (
                                        <span className="text-lg font-bold text-foreground-muted">{guest.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white">{guest.name}</p>
                                    <div className="flex items-center gap-3 text-sm text-foreground-muted flex-wrap">
                                        <span>{guest.pax} pax</span>
                                        <span>•</span>
                                        <span>Table {guest.table}</span>
                                        <span>•</span>
                                        <span className="text-primary">{guest.event}</span>
                                        {guest.checkInTime && (
                                            <>
                                                <span>•</span>
                                                <span className="text-success">{guest.checkInTime}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {!guest.checkedIn && (
                                    <button
                                        onClick={() => handleCheckIn(guest.id)}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <UserCheck className="w-4 h-4" />
                                        Check In
                                    </button>
                                )}
                                {guest.checkedIn && (
                                    <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm font-medium">
                                        Checked In
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-8 text-center animate-fade-in max-w-sm">
                        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-success" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Checked In!</h3>
                        <p className="text-foreground-muted">{lastCheckedIn} has been checked in successfully.</p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
