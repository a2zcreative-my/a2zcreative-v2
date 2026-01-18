"use client";

import { DashboardLayout } from "@/components/layout";
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
} from "lucide-react";
import { useState } from "react";

// Mock data for all users
const allUsers = [
    {
        id: "1",
        name: "Ahmad bin Hassan",
        email: "ahmad@example.com",
        phone: "+60 12-345 6789",
        role: "client",
        plan: "premium",
        eventsCount: 3,
        totalSpent: "RM 450",
        status: "active",
        joinedAt: "2025-11-15",
    },
    {
        id: "2",
        name: "Fatimah Lee",
        email: "fatimah@example.com",
        phone: "+60 13-456 7890",
        role: "client",
        plan: "basic",
        eventsCount: 1,
        totalSpent: "RM 99",
        status: "active",
        joinedAt: "2025-12-01",
    },
    {
        id: "3",
        name: "TechCorp Admin",
        email: "admin@techcorp.com",
        phone: "+60 3-9876 5432",
        role: "client",
        plan: "exclusive",
        eventsCount: 5,
        totalSpent: "RM 2,500",
        status: "active",
        joinedAt: "2025-10-20",
    },
    {
        id: "4",
        name: "Zainab Abdullah",
        email: "zainab@example.com",
        phone: "+60 11-234 5678",
        role: "client",
        plan: "premium",
        eventsCount: 2,
        totalSpent: "RM 300",
        status: "suspended",
        joinedAt: "2025-09-10",
    },
    {
        id: "5",
        name: "Super Admin",
        email: "superadmin@a2zcreative.com",
        phone: "+60 12-000 0000",
        role: "admin",
        plan: "-",
        eventsCount: 0,
        totalSpent: "-",
        status: "active",
        joinedAt: "2025-01-01",
    },
];

const stats = [
    { label: "Total Users", value: "1,247", icon: Users, color: "primary", bgColor: "bg-primary/20" },
    { label: "Active Users", value: "1,189", icon: UserPlus, color: "success", bgColor: "bg-success/20" },
    { label: "Admins", value: "3", icon: ShieldCheck, color: "warning", bgColor: "bg-warning/20" },
];

export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredUsers = allUsers.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Users
                    </h1>
                    <p className="text-foreground-muted">
                        Manage all platform users and their permissions
                    </p>
                </div>

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

                {/* Users Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--glass-border)]">
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">User</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Role</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Plan</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Events</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Spent</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-[var(--glass-border)] hover:bg-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
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
                                            {user.plan !== "-" ? (
                                                <span className={`badge-${user.plan} text-xs font-bold px-2 py-1 rounded-full text-white`}>
                                                    {user.plan.toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="text-foreground-muted">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-white">{user.eventsCount}</td>
                                        <td className="p-4 text-white">{user.totalSpent}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${user.status === "active"
                                                    ? "bg-success/20 text-success"
                                                    : "bg-error/20 text-error"
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors" title="Send Email">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors" title="Suspend User">
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
