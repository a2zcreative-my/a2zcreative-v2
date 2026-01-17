"use client";

import { useState } from "react";
import Sidebar, { Menu } from "./Sidebar";
import { Bell, HelpCircle } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="md:ml-64 min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 border-b border-[var(--glass-border)] bg-background/80 backdrop-blur-xl">
                    <div className="h-full px-4 md:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-foreground-muted hover:text-white transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Notifications */}
                            <button className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-foreground-muted hover:text-white transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                            {/* Help */}
                            <button className="hidden sm:flex w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] items-center justify-center text-foreground-muted hover:text-white transition-colors">
                                <HelpCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
