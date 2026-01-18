"use client";

import {
    Ticket,
    Search,
    Filter,
    MoreVertical,
    MessageSquare,
    CheckCircle,
    Clock,
    AlertCircle,
    User,
} from "lucide-react";
import { useState } from "react";

// Mock tickets data
const tickets = [
    {
        id: "TKT-001",
        subject: "Cannot upload invitation image",
        description: "I'm trying to upload a PNG file but it keeps showing an error. The file is under 2MB.",
        user: "Ahmad bin Hassan",
        email: "ahmad@example.com",
        category: "Technical",
        priority: "high",
        status: "open",
        createdAt: "2026-01-18 14:32",
        lastReply: "2026-01-18 15:10",
    },
    {
        id: "TKT-002",
        subject: "Request for refund",
        description: "I accidentally purchased the wrong plan and would like to request a refund.",
        user: "Fatimah Lee",
        email: "fatimah@example.com",
        category: "Billing",
        priority: "medium",
        status: "in_progress",
        createdAt: "2026-01-17 09:15",
        lastReply: "2026-01-18 10:30",
    },
    {
        id: "TKT-003",
        subject: "How to add custom RSVP questions?",
        description: "I want to add dietary restrictions question to my RSVP form. Is this possible?",
        user: "Zainab Abdullah",
        email: "zainab@example.com",
        category: "Feature Request",
        priority: "low",
        status: "open",
        createdAt: "2026-01-16 16:45",
        lastReply: null,
    },
    {
        id: "TKT-004",
        subject: "Event page not loading",
        description: "My guests are reporting that the invitation page shows a blank screen on mobile.",
        user: "TechCorp Admin",
        email: "admin@techcorp.com",
        category: "Bug Report",
        priority: "high",
        status: "resolved",
        createdAt: "2026-01-15 11:20",
        lastReply: "2026-01-15 14:45",
    },
    {
        id: "TKT-005",
        subject: "Upgrade plan inquiry",
        description: "What are the benefits of upgrading to Exclusive plan?",
        user: "Mohammad Ali",
        email: "ali@example.com",
        category: "Sales",
        priority: "low",
        status: "resolved",
        createdAt: "2026-01-14 08:30",
        lastReply: "2026-01-14 09:00",
    },
];

const stats = [
    { label: "Open Tickets", value: "12", icon: AlertCircle, color: "warning", bgColor: "bg-warning/20" },
    { label: "In Progress", value: "5", icon: Clock, color: "info", bgColor: "bg-info/20" },
    { label: "Resolved Today", value: "8", icon: CheckCircle, color: "success", bgColor: "bg-success/20" },
];

export default function AdminTicketsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-error/20 text-error";
            case "medium":
                return "bg-warning/20 text-warning";
            default:
                return "bg-foreground-muted/20 text-foreground-muted";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "open":
                return "bg-warning/20 text-warning";
            case "in_progress":
                return "bg-info/20 text-info";
            case "resolved":
                return "bg-success/20 text-success";
            default:
                return "bg-foreground-muted/20 text-foreground-muted";
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Support Tickets
                </h1>
                <p className="text-foreground-muted">
                    Review and respond to client support requests
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-4 md:p-5">
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
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50 text-sm md:text-base"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 md:px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-primary/50 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 md:px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-primary/50 text-sm"
                    >
                        <option value="all">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="glass-card p-4 md:p-5 hover:border-primary/30 transition-all cursor-pointer"
                    >
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-xs font-mono text-foreground-muted">{ticket.id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                    <span className="text-xs text-foreground-muted bg-background-tertiary px-2 py-0.5 rounded-full">
                                        {ticket.category}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-white mb-1">{ticket.subject}</h3>
                                <p className="text-sm text-foreground-muted line-clamp-2 mb-3">{ticket.description}</p>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
                                    <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span>{ticket.user}</span>
                                    </div>
                                    <span>Created: {ticket.createdAt}</span>
                                    {ticket.lastReply && (
                                        <span>Last reply: {ticket.lastReply}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 md:flex-shrink-0">
                                <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Reply
                                </button>
                                <button className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredTickets.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Ticket className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Tickets Found</h3>
                    <p className="text-foreground-muted">No tickets match your current filters.</p>
                </div>
            )}
        </div>
    );
}
