"use client";

import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Ban,
    Shield,
    ShieldCheck,
    RefreshCw,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";

interface User {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar_url: string | null;
    plan: string;
    role: string;
    last_login: string | null;
    created_at: string;
    updated_at: string;
}

interface SyncStatus {
    totalUsers: number;
    adminCount: number;
}

export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Fetch users from D1
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/admin/users");
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    // Fetch sync status
    const fetchSyncStatus = async () => {
        try {
            const response = await fetch("/api/admin/sync-users");
            if (response.ok) {
                const data = await response.json();
                setSyncStatus(data);
            }
        } catch (err) {
            console.error("Failed to fetch sync status:", err);
        }
    };

    // Sync users from Supabase to D1
    const handleSync = async () => {
        try {
            setSyncing(true);
            setSyncMessage(null);

            // Include admin email for setting admin role
            const response = await fetch("/api/admin/sync-users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminEmails: ["admin@a2zcreative.my"] // Add your admin emails here
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSyncMessage(`✓ ${data.message}`);
                // Refresh users and status
                await fetchUsers();
                await fetchSyncStatus();
            } else {
                setSyncMessage(`✗ ${data.error}`);
            }
        } catch (err) {
            setSyncMessage(`✗ Sync failed: ${String(err)}`);
        } finally {
            setSyncing(false);
        }
    };

    // Action Handlers
    const handleEmail = (email: string) => {
        window.location.href = `mailto:${email}`;
    };

    const handleSuspend = (user: User) => {
        // Placeholder for future implementation
        alert(`Suspend feature coming soon for ${user.name || user.email}`);
    };

    const handleToggleRole = async (user: User) => {
        const newRole = user.role === "admin" ? "client" : "admin";
        if (!confirm(`Are you sure you want to make ${user.name || user.email} a ${newRole}?`)) return;

        setActionLoading(user.id);
        setOpenMenuId(null);

        try {
            const response = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, role: newRole }),
            });

            if (response.ok) {
                // Update local state
                setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            } else {
                alert("Failed to update user role");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update user role");
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchSyncStatus();
    }, []);

    const filteredUsers = users.filter((user) => {
        const matchesSearch = (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Check if user is online (last login within 15 minutes)
    const isOnline = (lastLogin: string | null): boolean => {
        if (!lastLogin) return false;
        const lastLoginTime = new Date(lastLogin).getTime();
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;
        return (now - lastLoginTime) < fifteenMinutes;
    };

    const stats = [
        { label: "Total Users", value: syncStatus?.totalUsers || users.length, icon: Users, color: "primary", bgColor: "bg-primary/20" },
        { label: "Active Users", value: users.length, icon: UserPlus, color: "success", bgColor: "bg-success/20" },
        { label: "Admins", value: syncStatus?.adminCount || users.filter(u => u.role === "admin").length, icon: ShieldCheck, color: "warning", bgColor: "bg-warning/20" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Users
                    </h1>
                    <p className="text-foreground-muted">
                        Manage all platform users and their permissions
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/50 text-primary rounded-xl hover:bg-primary/30 transition-colors disabled:opacity-50"
                >
                    {syncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    {syncing ? "Syncing..." : "Sync from Supabase"}
                </button>
            </div>

            {/* Sync Message */}
            {syncMessage && (
                <div className={`p-4 rounded-xl ${syncMessage.startsWith("✓") ? "bg-success/20 text-success" : "bg-error/20 text-error"}`}>
                    {syncMessage}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 text-${stat.color}`} strokeWidth={1.5} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-foreground-muted">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-foreground-muted" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="all">All Roles</option>
                        <option value="client">Clients</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-error/20 border border-error/50 rounded-xl p-6 text-center">
                    <AlertTriangle className="w-8 h-8 text-error mx-auto mb-2" />
                    <p className="text-error font-medium">Error Loading Users</p>
                    <p className="text-error/70 text-sm">{error}</p>
                    <button
                        onClick={fetchUsers}
                        className="mt-4 px-4 py-2 bg-error/20 text-error rounded-lg hover:bg-error/30"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="glass-card p-8 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-foreground-muted">Loading users...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && users.length === 0 && (
                <div className="glass-card p-8 text-center">
                    <Users className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Users in D1</h3>
                    <p className="text-foreground-muted mb-4">
                        Click "Sync from Supabase" to import all users from Supabase Auth
                    </p>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {syncing ? "Syncing..." : "Sync Users Now"}
                    </button>
                </div>
            )}

            {/* Users Table */}
            {!loading && !error && users.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--glass-border)]">
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">User</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Role</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Plan</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Last Login</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Joined</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-[var(--glass-border)] hover:bg-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={user.avatar_url}
                                                            alt={user.name || user.email}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                                                            {(user.name || user.email).charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {/* Online status indicator */}
                                                    <span
                                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background-secondary ${isOnline(user.last_login) ? "bg-success" : "bg-foreground-muted/50"
                                                            }`}
                                                        title={isOnline(user.last_login) ? "Online" : "Offline"}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name || "No name"}</p>
                                                    <p className="text-sm text-foreground-muted">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium w-fit ${user.role === "admin"
                                                ? "bg-warning/20 text-warning"
                                                : "bg-primary/20 text-primary"
                                                }`}>
                                                {user.role === "admin" ? <Shield className="w-3 h-3" /> : null}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.plan === "premium" ? "bg-accent/20 text-accent" :
                                                user.plan === "exclusive" ? "bg-secondary/20 text-secondary" :
                                                    "bg-primary/20 text-primary"
                                                }`}>
                                                {user.plan?.toUpperCase() || "STARTER"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-foreground-muted text-sm">
                                            {user.last_login ? new Date(user.last_login).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) : "Never"}
                                        </td>
                                        <td className="p-4 text-foreground-muted text-sm">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 relative">
                                                <button
                                                    onClick={() => handleEmail(user.email)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors"
                                                    title="Send Email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSuspend(user)}
                                                    className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"
                                                    title="Suspend User"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                                        className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors"
                                                    >
                                                        {actionLoading === user.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <MoreVertical className="w-4 h-4" />
                                                        )}
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {openMenuId === user.id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-background-secondary border border-[var(--glass-border)] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                                                            <button
                                                                onClick={() => handleToggleRole(user)}
                                                                className="w-full text-left px-4 py-3 text-sm text-foreground-muted hover:bg-white/5 hover:text-white flex items-center gap-2"
                                                            >
                                                                {user.role === "admin" ? (
                                                                    <>
                                                                        <Shield className="w-4 h-4" />
                                                                        Demote to Client
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ShieldCheck className="w-4 h-4" />
                                                                        Promote to Admin
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Backdrop to close menu */}
                                                {openMenuId === user.id && (
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={() => setOpenMenuId(null)}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
