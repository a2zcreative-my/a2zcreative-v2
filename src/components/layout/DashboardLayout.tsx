"use client";

import Sidebar from "./Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="ml-64 min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 border-b border-[var(--glass-border)] bg-background/80 backdrop-blur-xl">
                    <div className="h-full px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-foreground-muted hover:text-white transition-colors">
                                🔔
                            </button>
                            {/* Help */}
                            <button className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-foreground-muted hover:text-white transition-colors">
                                ❓
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
