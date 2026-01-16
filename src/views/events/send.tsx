"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import {
    PartyPopper,
    MessageCircle,
    Mail,
    LinkIcon,
    Facebook,
    Twitter,
    Rocket,
    Calendar,
    Copy,
    Check,
    Pencil,
    type LucideIcon,
} from "lucide-react";

const channelIcons: Record<string, LucideIcon> = {
    whatsapp: MessageCircle,
    email: Mail,
    link: LinkIcon,
    facebook: Facebook,
    twitter: Twitter,
};

const channels = [
    { id: "whatsapp", name: "WhatsApp", description: "Send via WhatsApp message", popular: true },
    { id: "email", name: "Email", description: "Send to email addresses" },
    { id: "link", name: "Copy Link", description: "Share anywhere with a link" },
    { id: "facebook", name: "Facebook", description: "Share on Facebook" },
    { id: "twitter", name: "Twitter/X", description: "Share on Twitter" },
];

export default function SendPage() {
    const params = useParams();
    const id = params?.id as string;
    const [selectedChannel, setSelectedChannel] = useState<string>("whatsapp");
    const [message, setMessage] = useState(
        "Assalamualaikum! 🌸\n\nAnda dijemput ke Majlis Perkahwinan Ahmad & Alia.\n\nKlik link di bawah untuk maklumat lanjut dan RSVP:"
    );
    const [sendOption, setSendOption] = useState<"now" | "schedule">("now");
    const [scheduleDate, setScheduleDate] = useState("");
    const [copied, setCopied] = useState(false);

    const inviteLink = "https://eventkad.my/i/ahmad-alia-2026";

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={11} eventId={id} />

            {/* Success Message */}
            <div className="max-w-4xl mx-auto mb-8 glass-card p-6 border-success/30 bg-success/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                        <PartyPopper className="w-6 h-6 text-success" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-success">Payment Successful!</h2>
                        <p className="text-foreground-muted">Your invitation is now published and ready to share</p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Send Invitation</h1>
                <p className="text-foreground-muted">Choose how you want to share your invitation</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Channels & Message */}
                <div className="space-y-6">
                    {/* Invitation Link */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Your Invitation Link</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inviteLink}
                                readOnly
                                className="input-field flex-1 text-primary"
                            />
                            <button onClick={handleCopyLink} className="btn-primary flex items-center gap-2">
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Share Channels */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Share Via</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {channels.map((channel) => {
                                const ChannelIcon = channelIcons[channel.id] || LinkIcon;
                                return (
                                    <button
                                        key={channel.id}
                                        onClick={() => setSelectedChannel(channel.id)}
                                        className={`p-4 rounded-xl text-left transition-all ${selectedChannel === channel.id
                                            ? "bg-primary/20 border-2 border-primary"
                                            : "bg-background-tertiary border-2 border-transparent hover:border-[var(--glass-border)]"
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                                            <ChannelIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <p className="text-white font-medium text-sm">{channel.name}</p>
                                        {channel.popular && (
                                            <span className="text-xs text-success">Popular</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Message */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Custom Message</h2>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className="input-field resize-none"
                        />
                    </div>
                </div>

                {/* Send Options */}
                <div className="space-y-6">
                    {/* Send Timing */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">When to Send?</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => setSendOption("now")}
                                className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${sendOption === "now"
                                    ? "bg-primary/20 border-2 border-primary"
                                    : "bg-background-tertiary border-2 border-transparent"
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Rocket className="w-5 h-5 text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-medium">Send Now</p>
                                    <p className="text-sm text-foreground-muted">Invite guests immediately</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setSendOption("schedule")}
                                className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${sendOption === "schedule"
                                    ? "bg-primary/20 border-2 border-primary"
                                    : "bg-background-tertiary border-2 border-transparent"
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-medium">Schedule for Later</p>
                                    <p className="text-sm text-foreground-muted">Pick a date and time</p>
                                </div>
                            </button>
                        </div>

                        {sendOption === "schedule" && (
                            <div className="mt-4">
                                <input
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        )}
                    </div>

                    {/* Guest Summary */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Sending To</h2>
                        <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]">
                            <p className="text-foreground-muted">Total Guests</p>
                            <p className="text-white font-semibold">156</p>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]">
                            <p className="text-foreground-muted">With Email</p>
                            <p className="text-white">124</p>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <p className="text-foreground-muted">With Phone</p>
                            <p className="text-white">142</p>
                        </div>
                        <Link href={`/events/${id}/guests`} className="text-primary text-sm mt-4 flex items-center gap-1">
                            <Pencil className="w-4 h-4" />
                            Manage guest list
                        </Link>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button className="btn-primary w-full animate-pulse-glow flex items-center justify-center gap-2">
                            {sendOption === "now" ? (
                                <>
                                    <Rocket className="w-5 h-5" />
                                    Send Invitations Now
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-5 h-5" />
                                    Schedule Invitations
                                </>
                            )}
                        </button>
                        <Link href="/dashboard" className="btn-secondary w-full text-center block">
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
