"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Loader2, X, Mail, UserMinus, Crown } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface TeamMember {
    id: string;
    role: string;
    created_at: string;
    user_id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
}

interface TeamInvite {
    id: string;
    invitee_email: string;
    role: string;
    status: string;
    expires_at: string;
    created_at: string;
}

export default function SettingsPage() {
    const { user, userRole, isAdmin, loading, persistentAvatarUrl, refreshAvatar, userPlan } = useAuth();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "team">("profile");

    // Team state
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [pendingInvites, setPendingInvites] = useState<TeamInvite[]>([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
    const [inviting, setInviting] = useState(false);
    const [teamMessage, setTeamMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form state for profile
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Security state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isToggling2FA, setIsToggling2FA] = useState(false);

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

                // Refresh avatar from D1 to update UI immediately
                await refreshAvatar();

                alert("Avatar updated successfully!");
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

    // Handle password change
    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        // Validate current password is provided
        if (!currentPassword) {
            setPasswordError("Please enter your current password");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setIsChangingPassword(true);

        try {
            // First, verify current password by re-authenticating
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: currentPassword
            });

            if (signInError) {
                setPasswordError("Current password is incorrect");
                setIsChangingPassword(false);
                return;
            }

            // If current password is correct, update to new password
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                setPasswordError(error.message);
            } else {
                setPasswordSuccess("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess("");
                }, 2000);
            }
        } catch (error) {
            setPasswordError("Failed to update password. Please try again.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle 2FA toggle (placeholder - Supabase 2FA requires additional setup)
    const handleToggle2FA = async () => {
        setIsToggling2FA(true);
        try {
            // Note: Supabase 2FA requires Phone Auth or TOTP setup
            // This is a placeholder that shows an alert
            alert("Two-Factor Authentication setup requires additional configuration. Please contact support.");
            setIs2FAEnabled(!is2FAEnabled);
        } catch (error) {
            console.error("2FA toggle error:", error);
        } finally {
            setIsToggling2FA(false);
        }
    };

    // Fetch team data when Team tab is active
    useEffect(() => {
        if (activeTab === "team" && userPlan === "exclusive") {
            fetchTeamData();
        }
    }, [activeTab, userPlan]);

    const fetchTeamData = async () => {
        setTeamLoading(true);
        try {
            const response = await fetch("/api/team/members");
            const data = await response.json();
            if (response.ok) {
                setTeamMembers(data.members || []);
                setPendingInvites(data.pendingInvites || []);
            }
        } catch (error) {
            console.error("Failed to fetch team data:", error);
        } finally {
            setTeamLoading(false);
        }
    };

    const handleInviteMember = async () => {
        if (!inviteEmail.trim()) return;
        setInviting(true);
        setTeamMessage(null);

        try {
            const response = await fetch("/api/team/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });

            const data = await response.json();

            if (response.ok) {
                setTeamMessage({ type: "success", text: data.message });
                setInviteEmail("");
                fetchTeamData(); // Refresh list
            } else {
                setTeamMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setTeamMessage({ type: "error", text: "Failed to send invitation" });
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm("Are you sure you want to remove this team member?")) return;

        try {
            const response = await fetch("/api/team/members", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId }),
            });

            if (response.ok) {
                setTeamMessage({ type: "success", text: "Team member removed" });
                fetchTeamData();
            } else {
                const data = await response.json();
                setTeamMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setTeamMessage({ type: "error", text: "Failed to remove team member" });
        }
    };

    const handleCancelInvite = async (inviteId: string) => {
        try {
            const response = await fetch("/api/team/invite", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteId }),
            });

            if (response.ok) {
                setTeamMessage({ type: "success", text: "Invitation cancelled" });
                fetchTeamData();
            } else {
                const data = await response.json();
                setTeamMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setTeamMessage({ type: "error", text: "Failed to cancel invitation" });
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
                    <div className="glass-card p-6">
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
                            {persistentAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--glass-border)]">
                                    <img
                                        src={persistentAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
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
                                <p className="text-xs text-foreground-muted mt-4">JPG, PNG max 2MB</p>
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
                                    className="input-field bg-background-tertiary/50 text-foreground-muted cursor-not-allowed opacity-60"
                                    disabled
                                    readOnly
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
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-white">Change Password</h3>
                                        <p className="text-sm text-foreground-muted">Update your password regularly</p>
                                    </div>
                                    <button
                                        className="btn-secondary text-sm"
                                        onClick={() => setShowPasswordModal(true)}
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                                        <p className="text-sm text-foreground-muted">Add extra security to your account</p>
                                    </div>
                                    <button
                                        className="btn-primary text-sm flex items-center gap-2"
                                        onClick={handleToggle2FA}
                                        disabled={isToggling2FA}
                                    >
                                        {isToggling2FA && <Loader2 className="w-3 h-3 animate-spin" />}
                                        {is2FAEnabled ? "Disable" : "Enable"}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-white">Active Sessions</h3>
                                        <p className="text-sm text-foreground-muted">Manage your logged in devices</p>
                                    </div>
                                    <button
                                        className="btn-secondary text-sm"
                                        onClick={() => setShowSessionsModal(true)}
                                    >
                                        View All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-card p-6 w-full max-w-md animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Change Password</h3>
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError("");
                                        setPasswordSuccess("");
                                        setCurrentPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                    }}
                                    className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="input-field w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="input-field w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-foreground-muted block mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="input-field w-full"
                                    />
                                </div>
                                {passwordError && (
                                    <p className="text-sm text-error">{passwordError}</p>
                                )}
                                {passwordSuccess && (
                                    <p className="text-sm text-success">{passwordSuccess}</p>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setPasswordError("");
                                            setCurrentPassword("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isChangingPassword ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Sessions Modal */}
                {showSessionsModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-card p-6 w-full max-w-md animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
                                <button
                                    onClick={() => setShowSessionsModal(false)}
                                    className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-background-tertiary">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-white">Current Session</p>
                                            <p className="text-xs text-foreground-muted">This device • Active now</p>
                                        </div>
                                        <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">Active</span>
                                    </div>
                                </div>
                                <p className="text-sm text-foreground-muted text-center">
                                    You are currently logged in on this device only.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSessionsModal(false)}
                                className="btn-secondary w-full mt-4"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                    <div className="glass-card p-6">
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
                    <TeamTabContent
                        userPlan={userPlan}
                        teamLoading={teamLoading}
                        teamMembers={teamMembers}
                        pendingInvites={pendingInvites}
                        inviteEmail={inviteEmail}
                        setInviteEmail={setInviteEmail}
                        inviteRole={inviteRole}
                        setInviteRole={setInviteRole}
                        inviting={inviting}
                        teamMessage={teamMessage}
                        getUserInitial={getUserInitial}
                        firstName={firstName}
                        lastName={lastName}
                        email={email}
                        onInvite={handleInviteMember}
                        onRemoveMember={handleRemoveMember}
                        onCancelInvite={handleCancelInvite}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}

// Team Tab Content Component
interface TeamTabContentProps {
    userPlan: string;
    teamLoading: boolean;
    teamMembers: TeamMember[];
    pendingInvites: TeamInvite[];
    inviteEmail: string;
    setInviteEmail: (email: string) => void;
    inviteRole: "editor" | "viewer";
    setInviteRole: (role: "editor" | "viewer") => void;
    inviting: boolean;
    teamMessage: { type: "success" | "error"; text: string } | null;
    getUserInitial: () => string;
    firstName: string;
    lastName: string;
    email: string;
    onInvite: () => void;
    onRemoveMember: (memberId: string) => void;
    onCancelInvite: (inviteId: string) => void;
}

function TeamTabContent({
    userPlan,
    teamLoading,
    teamMembers,
    pendingInvites,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviting,
    teamMessage,
    getUserInitial,
    firstName,
    lastName,
    email,
    onInvite,
    onRemoveMember,
    onCancelInvite,
}: TeamTabContentProps) {
    // Non-exclusive users see upgrade prompt
    if (userPlan !== "exclusive") {
        return (
            <div className="glass-card p-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                        <Crown className="w-8 h-8 text-warning" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Upgrade to Exclusive Plan</h2>
                    <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                        Team management is available on the Exclusive Plan. Invite team members to collaborate on your events.
                    </p>
                    <a href="/plans" className="btn-primary">
                        View Plans
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Team Members</h2>

            {/* Invite Form */}
            <div className="p-4 rounded-xl bg-background-tertiary mb-6">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Invite Team Member
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="input-field flex-1"
                    />
                    <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
                        className="input-field w-full sm:w-32"
                    >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                    </select>
                    <button
                        onClick={onInvite}
                        disabled={inviting || !inviteEmail.trim()}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Invite
                    </button>
                </div>
                {teamMessage && (
                    <p className={`text-sm mt-2 ${teamMessage.type === "success" ? "text-success" : "text-error"}`}>
                        {teamMessage.text}
                    </p>
                )}
            </div>

            {/* Loading State */}
            {teamLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            )}

            {!teamLoading && (
                <div className="space-y-4">
                    {/* Current User */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                {getUserInitial()}
                            </div>
                            <div>
                                <p className="font-medium text-white">
                                    {firstName} {lastName} (You)
                                </p>
                                <p className="text-sm text-foreground-muted">{email}</p>
                            </div>
                        </div>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Owner</span>
                    </div>

                    {/* Team Members */}
                    {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary">
                            <div className="flex items-center gap-4">
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt={member.name || ""} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-white font-bold">
                                        {(member.name || member.email).charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-white">{member.name || member.email}</p>
                                    <p className="text-sm text-foreground-muted">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full capitalize">
                                    {member.role}
                                </span>
                                <button
                                    onClick={() => onRemoveMember(member.id)}
                                    className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"
                                    title="Remove member"
                                >
                                    <UserMinus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Pending Invites */}
                    {pendingInvites.length > 0 && (
                        <>
                            <h3 className="text-sm font-medium text-foreground-muted mt-6 mb-3">Pending Invites</h3>
                            {pendingInvites.map((invite) => (
                                <div key={invite.id} className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary/50 border border-dashed border-foreground-muted/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-foreground-muted/20 flex items-center justify-center text-foreground-muted">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{invite.invitee_email}</p>
                                            <p className="text-xs text-foreground-muted">
                                                Expires {new Date(invite.expires_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">Pending</span>
                                        <button
                                            onClick={() => onCancelInvite(invite.id)}
                                            className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"
                                            title="Cancel invite"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Empty State */}
                    {teamMembers.length === 0 && pendingInvites.length === 0 && (
                        <p className="text-center text-foreground-muted py-4">
                            No team members yet. Invite someone to get started!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
