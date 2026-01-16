"use client";

import { X, Phone, MessageCircle } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: Array<{
        name: string;
        phone: string;
        role: string;
        whatsapp?: boolean;
    }>;
}

export default function ContactModal({ isOpen, onClose, contacts }: ContactModalProps) {
    if (!isOpen) return null;

    const handleWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-background rounded-2xl border border-[var(--glass-border)] shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="p-6 border-b border-[var(--glass-border)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Phone className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Contact Us</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-background-tertiary flex items-center justify-center text-foreground-muted hover:text-white hover:bg-error/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Contact List */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {contacts.map((contact, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-xl bg-background-tertiary border border-[var(--glass-border)]"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-white font-semibold">{contact.name}</p>
                                    <p className="text-sm text-foreground-muted">{contact.role}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {/* Call Button */}
                                <button
                                    onClick={() => handleCall(contact.phone)}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm font-medium">Call</span>
                                </button>

                                {/* WhatsApp Button */}
                                {contact.whatsapp && (
                                    <button
                                        onClick={() => handleWhatsApp(contact.phone)}
                                        className="flex-1 py-2.5 px-4 rounded-xl bg-success/20 text-success hover:bg-success/30 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">WhatsApp</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
