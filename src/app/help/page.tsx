"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import {
    HelpCircle,
    Send,
    MessageCircle,
    ChevronRight,
    Calendar,
    Users,
    CreditCard,
    Settings,
    CheckCircle,
    Loader2,
} from "lucide-react";

const helpCategories = [
    {
        title: "Getting Started",
        description: "Learn the basics of creating your first event",
        icon: Calendar,
        articles: [
            "How to create your first event",
            "Choosing the right plan",
            "Customizing your invitation design",
        ],
    },
    {
        title: "Guest Management",
        description: "Managing your guest list and RSVPs",
        icon: Users,
        articles: [
            "Adding and importing guests",
            "Sending invitations",
            "Tracking RSVP responses",
        ],
    },
    {
        title: "Billing & Payments",
        description: "Payment methods and subscription management",
        icon: CreditCard,
        articles: [
            "Available payment methods",
            "Upgrading your plan",
            "Refund policy",
        ],
    },
    {
        title: "Account Settings",
        description: "Managing your profile and preferences",
        icon: Settings,
        articles: [
            "Updating profile information",
            "Changing your password",
            "Notification preferences",
        ],
    },
];

const categories = [
    "Technical Issue",
    "Billing & Payments",
    "Feature Request",
    "Bug Report",
    "Other",
];

export default function HelpPage() {
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [ticketNumber, setTicketNumber] = useState("");
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        category: "",
        subject: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit ticket');
            }

            setTicketNumber(data.ticketNumber);
            setIsSubmitted(true);
            setFormData({ category: "", subject: "", description: "" });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setIsSubmitted(false);
        setTicketNumber("");
        setError("");
        setFormData({ category: "", subject: "", description: "" });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 md:space-y-8 animate-fade-in">
                {/* Header */}
                <div className="text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <HelpCircle className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                        How can we help you?
                    </h1>
                    <p className="text-sm md:text-base text-foreground-muted">
                        Find answers to common questions or submit a support ticket
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search for help..."
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl md:rounded-2xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50 text-center text-sm md:text-base"
                    />
                </div>

                {/* Help Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {helpCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.title} className="glass-card p-4 md:p-6">
                                <div className="flex items-center gap-3 mb-3 md:mb-4">
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-white text-sm md:text-base">{category.title}</h3>
                                        <p className="text-xs md:text-sm text-foreground-muted truncate">{category.description}</p>
                                    </div>
                                </div>
                                <ul className="space-y-1">
                                    {category.articles.map((article) => (
                                        <li key={article}>
                                            <button className="w-full flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-white/5 text-left text-foreground-muted hover:text-white transition-colors">
                                                <span className="text-xs md:text-sm">{article}</span>
                                                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Contact Support / Ticket Form */}
                <div className="glass-card p-5 md:p-8">
                    {!showForm && !isSubmitted && (
                        <div className="text-center">
                            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Need more help?</h3>
                            <p className="text-sm md:text-base text-foreground-muted mb-4 md:mb-6">
                                Submit a support ticket and our team will get back to you within 24 hours
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="btn-primary inline-flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit a Ticket
                                </button>
                                <button
                                    disabled
                                    className="btn-secondary inline-flex items-center justify-center gap-2 opacity-60 cursor-not-allowed text-sm md:text-base"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Live Chat
                                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">Soon</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {showForm && !isSubmitted && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-white">Submit a Support Ticket</h3>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-sm text-foreground-muted hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Category</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white focus:outline-none focus:border-primary/50 [&>option]:bg-background-secondary [&>option]:text-white"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Brief description of your issue"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Please provide as much detail as possible..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-foreground-muted focus:outline-none focus:border-primary/50 resize-none"
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-error/20 border border-error/30 text-error text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit Ticket
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {isSubmitted && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Ticket Submitted!</h3>
                            <div className="bg-background-tertiary rounded-xl p-4 mb-4 inline-block">
                                <p className="text-sm text-foreground-muted">Your ticket number</p>
                                <p className="text-2xl font-bold text-primary font-mono">{ticketNumber}</p>
                            </div>
                            <p className="text-foreground-muted mb-6">
                                Save this number for reference. Our team will respond within 24 hours.
                            </p>
                            <button
                                onClick={resetForm}
                                className="btn-secondary"
                            >
                                Back to Help
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
