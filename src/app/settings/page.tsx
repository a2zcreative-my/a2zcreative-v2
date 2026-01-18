"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Loader2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
    const { user, userRole, isAdmin, loading } = useAuth();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "team">("profile");

    // Form state for profile
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                // Update user metadata client-side
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { avatar_url: data.url }
                });

                if (updateError) throw updateError;

                alert("Avatar updated successfully!");
                // No reload needed
            } else {
                alert(`Upload failed: ${data.error}`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Populate form with user data
    useEffect(() => {
        if (user) {
            const fullName = user.user_metadata?.name || "";
            const nameParts = fullName.split(" ");
            setFirstName(nameParts[0] || "");
            setLastName(nameParts.slice(1).join(" ") || "");
            setEmail(user.email || "");
            setPhone(user.user_metadata?.phone || user.phone || "");
            setCompany(user.user_metadata?.company || "");
        }
    }, [user]);

    // Get user initial for avatar
    const getUserInitial = () => {
        if (firstName) return firstName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return "U";
    };

    // Handle profile save
    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveMessage("");

        try {
            // TODO: Implement actual profile update API call
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            setSaveMessage("Profile updated successfully!");
        } catch (error) {
            setSaveMessage("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                            {/* Role Badge */}
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isAdmin
                                ? "bg-warning/20 text-warning"
                                : "bg-primary/20 text-primary"
                                }`}>
                                {isAdmin && <Shield className="w-3 h-3" />}
                                {userRole.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--glass-border)]">
                                    <img
                                        src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                        alt={`${firstName} ${lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl text-white font-bold">
                                    {getUserInitial()}
                                </div>
                            )}
                            <div>
                                <label className="btn-secondary text-sm cursor-pointer relative overflow-hidden">
                                    {isUploading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </div>
                                    ) : (
                                        "Change Photo"
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                                <p className="text-xs text-foreground-muted mt-2">JPG, PNG max 2MB</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    disabled
                                />
                                <p className="text-xs text-foreground-muted mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+60 12-345 6789"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Company / Organization</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Optional"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                            <button
                                className="btn-primary flex items-center gap-2"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                            {saveMessage && (
                                <span className={`text-sm ${saveMessage.includes("success") ? "text-success" : "text-error"}`}>
                                    {saveMessage}
                                </span>
                            )}
                        </div>
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
                            {/* Current User as Owner */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                        {getUserInitial()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">
                                            {firstName} {lastName || "(You)"}
                                        </p>
                                        <p className="text-sm text-foreground-muted">{email}</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Owner</span>
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
