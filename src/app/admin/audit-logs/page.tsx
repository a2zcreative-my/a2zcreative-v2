"use client";

import { useState, useEffect } from "react";
import {
    History,
    Search,
    Loader2,
    AlertTriangle,
    User,
    Ticket,
    Calendar,
    FileText,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface AuditLog {
    id: string;
    admin_id: string;
    admin_email: string;
    action: string;
    target_type: string | null;
    target_id: string | null;
    details: string | null;
    created_at: string;
}

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/audit-logs?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error("Failed to fetch logs");
            const data = await response.json();
            setLogs(data.logs || []);
            setTotal(data.total || 0);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const getActionIcon = (action: string) => {
        if (action.startsWith("user.")) return <User className="w-4 h-4" />;
        if (action.startsWith("coupon.")) return <Ticket className="w-4 h-4" />;
        if (action.startsWith("event.")) return <Calendar className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };

    const getActionColor = (action: string) => {
        if (action.includes("create")) return "text-success";
        if (action.includes("delete")) return "text-error";
        if (action.includes("update") || action.includes("change")) return "text-warning";
        return "text-primary";
    };

    const formatAction = (action: string) => {
        return action.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" → ");
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.admin_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Audit Logs</h1>
                <p className="text-foreground-muted">Track admin actions and changes</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <History className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{total}</p>
                            <p className="text-sm text-foreground-muted">Total Logs</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {new Set(logs.map(l => l.admin_id)).size}
                            </p>
                            <p className="text-sm text-foreground-muted">Active Admins</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {logs.filter(l => {
                                    const today = new Date().toDateString();
                                    return new Date(l.created_at).toDateString() === today;
                                }).length}
                            </p>
                            <p className="text-sm text-foreground-muted">Actions Today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                    type="text"
                    placeholder="Search by action, admin, or target..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
                />
            </div>

            {/* Loading */}
            {loading && (
                <div className="glass-card p-8 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-foreground-muted">Loading logs...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass-card p-8 text-center">
                    <AlertTriangle className="w-8 h-8 text-error mx-auto mb-2" />
                    <p className="text-error">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && logs.length === 0 && (
                <div className="glass-card p-8 text-center">
                    <History className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Audit Logs Yet</h3>
                    <p className="text-foreground-muted">Admin actions will appear here once recorded</p>
                </div>
            )}

            {/* Logs List */}
            {!loading && !error && filteredLogs.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-[var(--glass-border)]">
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Time</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Admin</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Action</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Target</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-[var(--glass-border)] hover:bg-white/5">
                                        <td className="p-4 text-sm text-foreground-muted whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('en-MY', {
                                                timeZone: 'Asia/Kuala_Lumpur',
                                                dateStyle: 'short',
                                                timeStyle: 'short'
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white">{log.admin_email || 'Unknown'}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex items-center gap-2 ${getActionColor(log.action)}`}>
                                                {getActionIcon(log.action)}
                                                <span className="font-medium">{formatAction(log.action)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-foreground-muted text-sm">
                                            {log.target_type && log.target_id ? (
                                                <span className="font-mono text-xs bg-background-tertiary px-2 py-1 rounded">
                                                    {log.target_type}:{log.target_id.substring(0, 8)}...
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="p-4 text-foreground-muted text-sm max-w-xs truncate">
                                            {log.details ? (
                                                <span title={log.details} className="cursor-help">
                                                    {log.details.length > 50 ? log.details.substring(0, 50) + '...' : log.details}
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-[var(--glass-border)]">
                            <p className="text-sm text-foreground-muted">
                                Page {page} of {totalPages} ({total} total logs)
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
