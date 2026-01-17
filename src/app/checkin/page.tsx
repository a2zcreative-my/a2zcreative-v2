"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { QrCode, Search, UserCheck, Clock, Users, CheckCircle2, Camera, Keyboard } from "lucide-react";

// Mock check-in data
const mockCheckins = [
    { id: 1, name: "Ahmad bin Ali", pax: 4, checkedIn: true, checkInTime: "10:30 AM", table: "VIP 1" },
    { id: 2, name: "Amirul Hakim", pax: 3, checkedIn: true, checkInTime: "10:45 AM", table: "A5" },
    { id: 3, name: "Zulkifli Rahman", pax: 5, checkedIn: true, checkInTime: "11:00 AM", table: "B2" },
    { id: 4, name: "Muhammad Haziq", pax: 1, checkedIn: false, checkInTime: null, table: "C8" },
    { id: 5, name: "Siti Nurhaliza", pax: 2, checkedIn: false, checkInTime: null, table: "A3" },
    { id: 6, name: "Farah Diana", pax: 2, checkedIn: false, checkInTime: null, table: "B7" },
];

export default function CheckInPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [scanMode, setScanMode] = useState(false);

    const filteredGuests = mockCheckins.filter(guest =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: mockCheckins.length,
        checkedIn: mockCheckins.filter(g => g.checkedIn).length,
        pending: mockCheckins.filter(g => !g.checkedIn).length,
        totalPax: mockCheckins.reduce((sum, g) => sum + g.pax, 0),
        checkedInPax: mockCheckins.filter(g => g.checkedIn).reduce((sum, g) => sum + g.pax, 0),
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
                    <select className="input-field max-w-xs">
                        <option>Wedding Reception - Today</option>
                        <option>Birthday Party - Tomorrow</option>
                        <option>Corporate Event - Next Week</option>
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

                {/* Scanner or Search */}
                {scanMode ? (
                    <div className="glass-card p-8 mb-6 text-center">
                        <div className="w-64 h-64 mx-auto bg-background-tertiary rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--glass-border)]">
                            <div className="text-center">
                                <QrCode className="w-16 h-16 text-primary mx-auto mb-4" />
                                <p className="text-foreground-muted">Point camera at QR code</p>
                                <button className="btn-primary mt-4">
                                    Start Scanning
                                </button>
                            </div>
                        </div>
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
                    {filteredGuests.map((guest) => (
                        <div key={guest.id} className={`glass-card p-4 flex items-center gap-4 ${guest.checkedIn ? "border-success/30" : ""}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${guest.checkedIn ? "bg-success/20" : "bg-background-tertiary"}`}>
                                {guest.checkedIn ? (
                                    <CheckCircle2 className="w-6 h-6 text-success" />
                                ) : (
                                    <span className="text-lg font-bold text-foreground-muted">{guest.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white">{guest.name}</p>
                                <div className="flex items-center gap-3 text-sm text-foreground-muted">
                                    <span>{guest.pax} pax</span>
                                    <span>•</span>
                                    <span>Table {guest.table}</span>
                                    {guest.checkInTime && (
                                        <>
                                            <span>•</span>
                                            <span className="text-success">{guest.checkInTime}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {!guest.checkedIn && (
                                <button className="btn-primary flex items-center gap-2">
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
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
