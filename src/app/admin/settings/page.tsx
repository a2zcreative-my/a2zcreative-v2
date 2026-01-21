"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Shield,
    Server,
    Database,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    User,
    Upload,
    X,
    Lock,
    Mail,
    FileText,
    Download,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface PlatformStats {
    totalUsers: number;
    totalEvents: number;
    totalInvoices: number;
}


export default function AdminSettingsPage() {
    const { user, isAdmin, persistentAvatarUrl, refreshAvatar } = useAuth();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalEvents: 0, totalInvoices: 0 });
    const [activeTab, setActiveTab] = useState<"overview" | "integrations" | "profile" | "security" | "emails" | "export">("overview");
    const [uploading, setUploading] = useState(false);

    // Email templates state
    interface EmailTemplate {
        id: string;
        name: string;
        subject: string;
        body: string;
        variables: string;
    }
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [templateMessage, setTemplateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Export state
    const [exporting, setExporting] = useState<string | null>(null);

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

    // Handle password change
    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

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
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: currentPassword
            });

            if (signInError) {
                setPasswordError("Current password is incorrect");
                setIsChangingPassword(false);
                return;
            }

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

    // Handle 2FA toggle
    const handleToggle2FA = async () => {
        setIsToggling2FA(true);
        try {
            alert("Two-Factor Authentication setup requires additional configuration. Please contact support.");
            setIs2FAEnabled(!is2FAEnabled);
        } catch (error) {
            console.error("2FA toggle error:", error);
        } finally {
            setIsToggling2FA(false);
        }
    };

    // Fetch email templates when tab is active
    useEffect(() => {
        if (activeTab === "emails" && emailTemplates.length === 0) {
            fetchEmailTemplates();
        }
    }, [activeTab]);

    const fetchEmailTemplates = async () => {
        setTemplatesLoading(true);
        try {
            const response = await fetch("/api/admin/email-templates");
            const data = await response.json();
            if (response.ok) {
                setEmailTemplates(data.templates || []);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setTemplatesLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!editingTemplate) return;
        setSavingTemplate(true);
        setTemplateMessage(null);

        try {
            const response = await fetch("/api/admin/email-templates", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingTemplate.id,
                    subject: editingTemplate.subject,
                    body: editingTemplate.body,
                }),
            });

            if (response.ok) {
                setTemplateMessage({ type: "success", text: "Template saved successfully!" });
                fetchEmailTemplates();
                setTimeout(() => setEditingTemplate(null), 1500);
            } else {
                const data = await response.json();
                setTemplateMessage({ type: "error", text: data.error || "Failed to save" });
            }
        } catch (error) {
            setTemplateMessage({ type: "error", text: "Failed to save template" });
        } finally {
            setSavingTemplate(false);
        }
    };

    const handleExport = async (type: string) => {
        setExporting(type);
        try {
            const response = await fetch(`/api/admin/export?type=${type}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${type}_export.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Export error:", error);
            alert("Export failed. Please try again.");
        } finally {
            setExporting(null);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                // Update user metadata client-side to ensure session sync
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { avatar_url: data.url }
                });

                if (updateError) {
                    throw updateError;
                }

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
            setUploading(false);
        }
    };


    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats({
                        totalUsers: data.stats?.totalUsers || 0,
                        totalEvents: data.stats?.totalEvents || 0,
                        totalInvoices: data.stats?.totalInvoices || 0,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in pt-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Platform Settings
                    </h1>
                    <p className="text-foreground-muted">
                        Configure platform settings and integrations
                    </p>
                </div>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pt-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Platform Settings
                </h1>
                <p className="text-foreground-muted">
                    Configure platform settings and integrations
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {(["overview", "profile", "security", "emails", "export", "integrations"] as const).map((tab) => (
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

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* System Status */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" />
                            System Status
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-background-tertiary">
                                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">API Status</p>
                                    <p className="text-sm text-success">Operational</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-background-tertiary">
                                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                    <Database className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Database</p>
                                    <p className="text-sm text-success">Connected (D1)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-background-tertiary">
                                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Auth</p>
                                    <p className="text-sm text-success">Supabase Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Platform Stats */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Platform Overview
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-xl bg-background-tertiary">
                                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                                <p className="text-sm text-foreground-muted">Total Users</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-background-tertiary">
                                <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
                                <p className="text-sm text-foreground-muted">Total Events</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-background-tertiary">
                                <p className="text-3xl font-bold text-white">{stats.totalInvoices}</p>
                                <p className="text-sm text-foreground-muted">Total Invoices</p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Info */}
                    <div className="glass-card p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Admin Access</h3>
                                <p className="text-sm text-foreground-muted">
                                    You have full administrative access to the platform. All changes made here will affect the entire system.
                                    Please exercise caution when modifying platform settings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Admin Profile
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--glass-border)] bg-background-tertiary">
                                    {persistentAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                                        <img
                                            src={persistentAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                                            alt={user?.email || "Admin"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-4xl text-white font-bold">
                                            {(user?.email || "A").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Upload className="w-5 h-5" />
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarUpload}
                                        disabled={uploading}
                                    />
                                </label>
                                <p className="text-xs text-foreground-muted mt-4 text-center">JPG, PNG max 2MB</p>
                            </div>

                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-1">Email</label>
                                    <input
                                        type="text"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white opacity-60 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground-muted mb-1">Role</label>
                                    <input
                                        type="text"
                                        value="Super Admin"
                                        disabled
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-primary font-bold opacity-80 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Security Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-background-tertiary">
                                <div className="flex items-center justify-between">
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
                                <div className="flex items-center justify-between">
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
                                <div className="flex items-center justify-between">
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

            {/* Email Templates Tab */}
            {activeTab === "emails" && (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Email Templates
                        </h2>

                        {templatesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {emailTemplates.map((template) => (
                                    <div key={template.id} className="p-4 rounded-xl bg-background-tertiary">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-white">{template.name}</h3>
                                                <p className="text-sm text-foreground-muted">{template.subject}</p>
                                            </div>
                                            <button
                                                onClick={() => setEditingTemplate({ ...template })}
                                                className="btn-secondary text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {emailTemplates.length === 0 && (
                                    <p className="text-center text-foreground-muted py-4">
                                        No email templates found. Run the schema.sql to seed templates.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Email Template Editor Modal */}
            {editingTemplate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Edit: {editingTemplate.name}</h3>
                            <button
                                onClick={() => {
                                    setEditingTemplate(null);
                                    setTemplateMessage(null);
                                }}
                                className="p-2 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={editingTemplate.subject}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Body (HTML)</label>
                                <textarea
                                    value={editingTemplate.body}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                    rows={10}
                                    className="input-field w-full font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Available Variables</label>
                                <p className="text-xs text-primary">{editingTemplate.variables}</p>
                            </div>
                            {templateMessage && (
                                <p className={`text-sm ${templateMessage.type === "success" ? "text-success" : "text-error"}`}>
                                    {templateMessage.text}
                                </p>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setEditingTemplate(null);
                                        setTemplateMessage(null);
                                    }}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTemplate}
                                    disabled={savingTemplate}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {savingTemplate && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {savingTemplate ? "Saving..." : "Save Template"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Export Tab */}
            {activeTab === "export" && (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Download className="w-5 h-5 text-primary" />
                            Data Export
                        </h2>
                        <p className="text-sm text-foreground-muted mb-6">
                            Export platform data as CSV files for reporting and backup purposes.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-background-tertiary text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-medium text-white mb-2">Users</h3>
                                <p className="text-xs text-foreground-muted mb-4">Export all registered users</p>
                                <button
                                    onClick={() => handleExport("users")}
                                    disabled={exporting === "users"}
                                    className="btn-secondary text-sm w-full flex items-center justify-center gap-2"
                                >
                                    {exporting === "users" && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {exporting === "users" ? "Exporting..." : "Export CSV"}
                                </button>
                            </div>
                            <div className="p-4 rounded-xl bg-background-tertiary text-center">
                                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-secondary" />
                                </div>
                                <h3 className="font-medium text-white mb-2">Events</h3>
                                <p className="text-xs text-foreground-muted mb-4">Export all events data</p>
                                <button
                                    onClick={() => handleExport("events")}
                                    disabled={exporting === "events"}
                                    className="btn-secondary text-sm w-full flex items-center justify-center gap-2"
                                >
                                    {exporting === "events" && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {exporting === "events" ? "Exporting..." : "Export CSV"}
                                </button>
                            </div>
                            <div className="p-4 rounded-xl bg-background-tertiary text-center">
                                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-success" />
                                </div>
                                <h3 className="font-medium text-white mb-2">Invoices</h3>
                                <p className="text-xs text-foreground-muted mb-4">Export all invoices</p>
                                <button
                                    onClick={() => handleExport("invoices")}
                                    disabled={exporting === "invoices"}
                                    className="btn-secondary text-sm w-full flex items-center justify-center gap-2"
                                >
                                    {exporting === "invoices" && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {exporting === "invoices" ? "Exporting..." : "Export CSV"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Active Integrations</h2>
                        <div className="space-y-3">
                            {[
                                { name: "Supabase Auth", status: "connected", description: "User authentication and management" },
                                { name: "Cloudflare D1", status: "connected", description: "Database storage" },
                                { name: "Cloudflare R2", status: "connected", description: "File storage" },
                                { name: "Billplz", status: "connected", description: "Payment processing" },
                                { name: "Resend", status: "connected", description: "Email delivery" },
                            ].map((integration) => (
                                <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-success" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{integration.name}</p>
                                            <p className="text-xs text-foreground-muted">{integration.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                                        {integration.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">External Links</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { name: "Cloudflare Dashboard", url: "https://dash.cloudflare.com/" },
                                { name: "Supabase Dashboard", url: "https://supabase.com/dashboard" },
                                { name: "Billplz Dashboard", url: "https://www.billplz.com/enterprise/login" },
                                { name: "Resend Dashboard", url: "https://resend.com/overview" },
                            ].map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary hover:border-primary/30 border border-transparent transition-all"
                                >
                                    <span className="text-white">{link.name}</span>
                                    <ExternalLink className="w-4 h-4 text-foreground-muted" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
