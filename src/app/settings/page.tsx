"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "team">("profile");

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-foreground-muted">Manage your account preferences</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                    {(["profile", "security", "notifications", "team"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl font-medium capitalize transition-all ${activeTab === tab ? "bg-primary text-white" : "bg-background-tertiary text-foreground-muted"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="glass-card p-6 max-w-2xl">
                        <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl text-white font-bold">
                                O
                            </div>
                            <div>
                                <button className="btn-secondary text-sm">Change Photo</button>
                                <p className="text-xs text-foreground-muted mt-2">JPG, PNG max 2MB</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">First Name</label>
                                    <input type="text" defaultValue="Organizer" className="input-field" />
                                </div>
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Last Name</label>
                                    <input type="text" defaultValue="Name" className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Email</label>
                                <input type="email" defaultValue="organizer@email.com" className="input-field" />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Phone</label>
                                <input type="tel" defaultValue="+60 12-345 6789" className="input-field" />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Company / Organization</label>
                                <input type="text" placeholder="Optional" className="input-field" />
                            </div>
                        </div>
                        <button className="btn-primary mt-6">Save Changes</button>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                    <div className="glass-card p-6 max-w-2xl">
                        <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-white">Change Password</h3>
                                        <p className="text-sm text-foreground-muted">Update your password regularly</p>
                                    </div>
                                    <button className="btn-secondary text-sm">Change</button>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                                        <p className="text-sm text-foreground-muted">Add extra security to your account</p>
                                    </div>
                                    <button className="btn-primary text-sm">Enable</button>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-white">Active Sessions</h3>
                                        <p className="text-sm text-foreground-muted">Manage your logged in devices</p>
                                    </div>
                                    <button className="btn-secondary text-sm">View All</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                    <div className="glass-card p-6 max-w-2xl">
                        <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
                        <div className="space-y-4">
                            {[
                                { label: "RSVP Updates", desc: "Get notified when guests respond" },
                                { label: "Event Reminders", desc: "Receive reminders before your events" },
                                { label: "Payment Confirmations", desc: "Get receipts and payment updates" },
                                { label: "Marketing Emails", desc: "Tips, offers, and product updates" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary">
                                    <div>
                                        <h3 className="font-medium text-white">{item.label}</h3>
                                        <p className="text-sm text-foreground-muted">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-background-secondary rounded-full peer peer-checked:bg-primary transition-colors"></div>
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary mt-6">Save Preferences</button>
                    </div>
                )}

                {/* Team Tab */}
                {activeTab === "team" && (
                    <div className="glass-card p-6 max-w-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Team Members</h2>
                            <button className="btn-primary text-sm">+ Invite Member</button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                        O
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Organizer Name</p>
                                        <p className="text-sm text-foreground-muted">organizer@email.com</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Owner</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                                        A
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Assistant Name</p>
                                        <p className="text-sm text-foreground-muted">assistant@email.com</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-foreground-muted/20 text-foreground-muted px-2 py-1 rounded-full">Editor</span>
                            </div>
                        </div>
                        <p className="text-xs text-foreground-muted mt-6 text-center">
                            Team management is available on Exclusive Plan
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
