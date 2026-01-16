"use client";

import Link from "next/link";
import { useState, use } from "react";
import StepIndicator from "@/components/StepIndicator";

const roles = ["Bride", "Groom", "Father of Bride", "Mother of Bride", "Father of Groom", "Mother of Groom", "Organizer", "Event Coordinator", "Other"];

export default function ContactPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [contacts, setContacts] = useState([
        { id: "1", name: "", phone: "", whatsapp: true, role: "" },
    ]);

    const addContact = () => {
        setContacts([...contacts, { id: Date.now().toString(), name: "", phone: "", whatsapp: true, role: "" }]);
    };

    const removeContact = (contactId: string) => {
        if (contacts.length > 1) {
            setContacts(contacts.filter(c => c.id !== contactId));
        }
    };

    const updateContact = (contactId: string, field: string, value: string | boolean) => {
        setContacts(contacts.map(c =>
            c.id === contactId ? { ...c, [field]: value } : c
        ));
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={5} eventId={id} />

            {/* Header */}
            <div className="max-w-3xl mx-auto mb-8">
                <Link href={`/events/${id}/sections`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    ← Back to Sections
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Contact Person 👤</h1>
                <p className="text-foreground-muted">Add contact details for guests to reach out</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {contacts.map((contact, index) => (
                    <div key={contact.id} className="glass-card p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white">Contact #{index + 1}</h3>
                            {contacts.length > 1 && (
                                <button
                                    onClick={() => removeContact(contact.id)}
                                    className="text-error text-sm hover:text-error/80"
                                >
                                    🗑️ Remove
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={contact.name}
                                    onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                                    placeholder="e.g., Ahmad bin Ali"
                                    className="input-field"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Phone Number *</label>
                                <div className="flex gap-2">
                                    <select className="input-field w-24">
                                        <option>+60</option>
                                        <option>+65</option>
                                        <option>+62</option>
                                    </select>
                                    <input
                                        type="tel"
                                        value={contact.phone}
                                        onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                                        placeholder="12-345 6789"
                                        className="input-field flex-1"
                                    />
                                </div>
                            </div>

                            {/* WhatsApp Toggle */}
                            <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">💬</span>
                                    <div>
                                        <p className="text-white font-medium">WhatsApp Click-to-Chat</p>
                                        <p className="text-xs text-foreground-muted">Allow guests to message via WhatsApp</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateContact(contact.id, "whatsapp", !contact.whatsapp)}
                                    className={`w-12 h-6 rounded-full transition-all ${contact.whatsapp ? "bg-success" : "bg-background-secondary"
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${contact.whatsapp ? "translate-x-6" : "translate-x-0"
                                        }`} />
                                </button>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Role (Optional)</label>
                                <select
                                    value={contact.role}
                                    onChange={(e) => updateContact(contact.id, "role", e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Select role...</option>
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Contact Button */}
                <button
                    onClick={addContact}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-[var(--glass-border)] text-foreground-muted hover:text-white hover:border-primary transition-colors flex items-center justify-center gap-2"
                >
                    ➕ Add Another Contact
                </button>

                {/* Navigation */}
                <div className="flex gap-4 pt-4">
                    <Link href={`/events/${id}/sections`} className="btn-secondary flex-1 text-center">
                        ← Back
                    </Link>
                    <Link href={`/events/${id}/itinerary`} className="btn-primary flex-1 text-center">
                        Continue to Itinerary →
                    </Link>
                </div>
            </div>
        </div>
    );
}
