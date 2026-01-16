"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState, use } from "react";

const checkedInGuests = [
    { id: "1", name: "Ahmad bin Ali", pax: 4, checkedInAt: "12:05 PM", table: "VIP-1" },
    { id: "2", name: "Siti binti Hassan", pax: 2, checkedInAt: "12:12 PM", table: "A-3" },
    { id: "3", name: "Tan Wei Ming", pax: 3, checkedInAt: "12:18 PM", table: "B-5" },
];

export default function CheckInPage() {
    const params = useParams(); const id = params?.id as string;
    const [searchQuery, setSearchQuery] = useState("");
    const [showScanner, setShowScanner] = useState(true);
    const [lastScanned, setLastScanned] = useState<{ name: string; pax: number } | null>(null);

    const stats = {
        expected: 156,
        checkedIn: 45,
        remaining: 111,
    };

    const handleManualCheckIn = () => {
        if (searchQuery) {
            setLastScanned({ name: searchQuery, pax: 2 });
            setSearchQuery("");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-background-secondary border-b border-[var(--glass-border)] p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/events/${id}/rsvp`} className="text-foreground-muted hover:text-white">
                            ← Back
                        </Link>
                        <h1 className="text-xl font-bold text-white">Event Day Check-In</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-success">{stats.checkedIn}</p>
                            <p className="text-xs text-foreground-muted">Checked In</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-warning">{stats.remaining}</p>
                            <p className="text-xs text-foreground-muted">Remaining</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scanner / Search Section */}
                <div className="space-y-6">
                    {/* QR Scanner */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">QR Scanner</h2>
                            <button
                                onClick={() => setShowScanner(!showScanner)}
                                className="text-sm text-primary"
                            >
                                {showScanner ? "Hide Scanner" : "Show Scanner"}
                            </button>
                        </div>

                        {showScanner && (
                            <div className="aspect-square bg-black rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                                <div className="absolute inset-4 border-2 border-primary rounded-lg" />
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary animate-pulse" />
                                <p className="text-foreground-muted text-sm">Camera access required</p>
                            </div>
                        )}

                        <p className="text-sm text-foreground-muted text-center">
                            Point camera at guest&apos;s QR code to check in
                        </p>
                    </div>

                    {/* Manual Search */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Manual Search</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field flex-1"
                            />
                            <button onClick={handleManualCheckIn} className="btn-primary">
                                Check In
                            </button>
                        </div>

                        {/* Search Results */}
                        {searchQuery && (
                            <div className="space-y-2 mt-4">
                                <div className="p-3 rounded-lg bg-background-tertiary flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{searchQuery}</p>
                                        <p className="text-sm text-foreground-muted">RSVP: 4 pax</p>
                                    </div>
                                    <button className="btn-primary text-sm py-2">Check In</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Last Scanned */}
                    {lastScanned && (
                        <div className="glass-card p-6 border-success/30 bg-success/10 animate-fade-in">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">✅</div>
                                <div>
                                    <p className="text-success font-bold text-lg">Checked In!</p>
                                    <p className="text-white">{lastScanned.name} ({lastScanned.pax} pax)</p>
                                </div>
                            </div>
                            <button className="btn-secondary w-full mt-4">
                                🖨️ Print Badge
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Check-ins List */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Recent Check-ins</h2>
                        <span className="text-sm text-foreground-muted">
                            {checkedInGuests.length} guests
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {checkedInGuests.map((guest) => (
                            <div
                                key={guest.id}
                                className="p-4 rounded-xl bg-background-tertiary flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center font-bold">
                                        {guest.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{guest.name}</p>
                                        <p className="text-sm text-foreground-muted">{guest.pax} pax • Table {guest.table}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-success">✓ Checked In</p>
                                    <p className="text-xs text-foreground-muted">{guest.checkedInAt}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress */}
                    <div className="mt-6 pt-4 border-t border-[var(--glass-border)]">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-foreground-muted">Check-in Progress</span>
                            <span className="text-white">{Math.round((stats.checkedIn / stats.expected) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-background-tertiary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all"
                                style={{ width: `${(stats.checkedIn / stats.expected) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


