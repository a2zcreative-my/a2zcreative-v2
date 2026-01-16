"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import {
    Gift,
    Landmark,
    Smartphone,
    Package,
    Upload,
    Eye,
    ArrowLeft,
    ArrowRight,
    type LucideIcon,
} from "lucide-react";

const giftTypeIcons: Record<string, LucideIcon> = {
    bank: Landmark,
    ewallet: Smartphone,
    physical: Package,
};

const giftTypes = [
    { id: "bank", name: "Bank Transfer" },
    { id: "ewallet", name: "E-Wallet" },
    { id: "physical", name: "Physical Gift" },
];

const malaysianBanks = [
    "Maybank",
    "CIMB Bank",
    "Public Bank",
    "RHB Bank",
    "Hong Leong Bank",
    "AmBank",
    "Bank Islam",
    "Bank Rakyat",
    "Bank Simpanan Nasional (BSN)",
    "Affin Bank",
    "Alliance Bank",
    "Standard Chartered",
    "HSBC",
    "OCBC Bank",
    "UOB Malaysia",
    "Citibank",
];

const eWallets = [
    "Touch 'n Go eWallet",
    "GrabPay",
    "Boost",
    "ShopeePay",
    "MAE by Maybank",
    "BigPay",
    "Setel",
];

export default function GiftPage() {
    const params = useParams();
    const id = params?.id as string;
    const [giftType, setGiftType] = useState("bank");
    const [bankDetails, setBankDetails] = useState({
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        qrCode: null as File | null,
    });
    const [ewalletDetails, setEwalletDetails] = useState({
        provider: "",
        phoneNumber: "",
        accountName: "",
        qrCode: null as File | null,
    });
    const [physicalGift, setPhysicalGift] = useState({
        address: "",
        notes: "",
    });

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={7} eventId={id} />

            {/* Header */}
            <div className="max-w-3xl mx-auto mb-8">
                <Link href={`/events/${id}/itinerary`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Itinerary
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    Gift / Bank Details
                    <Gift className="w-8 h-8 text-primary" />
                </h1>
                <p className="text-foreground-muted">Let guests know how they can send gifts</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Gift Type Selection */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">How would you like to receive gifts?</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {giftTypes.map((type) => {
                            const TypeIcon = giftTypeIcons[type.id] || Gift;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setGiftType(type.id)}
                                    className={`p-4 rounded-xl text-center transition-all ${giftType === type.id
                                        ? "ring-2 ring-primary bg-primary/10"
                                        : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                        <TypeIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-sm text-white font-medium">{type.name}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bank Transfer Details */}
                {giftType === "bank" && (
                    <div className="glass-card p-6 animate-fade-in">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-primary" />
                            Bank Transfer Details
                        </h2>
                        <div className="space-y-4">
                            {/* Bank Name Dropdown */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Bank Name *</label>
                                <select
                                    value={bankDetails.bankName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select your bank...</option>
                                    {malaysianBanks.map(bank => (
                                        <option key={bank} value={bank}>{bank}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Account Number *</label>
                                <input
                                    type="text"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    placeholder="e.g., 1234 5678 9012"
                                    className="input-field"
                                />
                            </div>

                            {/* Account Holder */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Account Holder Name *</label>
                                <input
                                    type="text"
                                    value={bankDetails.accountHolder}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                                    placeholder="Name as shown on bank account"
                                    className="input-field"
                                />
                            </div>

                            {/* QR Code Upload */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">DuitNow QR Code (Optional)</label>
                                <div className="p-6 rounded-xl border-2 border-dashed border-[var(--glass-border)] text-center cursor-pointer hover:border-primary transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                        <Upload className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-sm text-foreground-muted">Click to upload QR code image</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* E-Wallet Details */}
                {giftType === "ewallet" && (
                    <div className="glass-card p-6 animate-fade-in">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-primary" />
                            E-Wallet Details
                        </h2>
                        <div className="space-y-4">
                            {/* E-Wallet Provider */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">E-Wallet Provider *</label>
                                <select
                                    value={ewalletDetails.provider}
                                    onChange={(e) => setEwalletDetails({ ...ewalletDetails, provider: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select e-wallet...</option>
                                    {eWallets.map(wallet => (
                                        <option key={wallet} value={wallet}>{wallet}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Phone Number *</label>
                                <div className="flex gap-2">
                                    <select className="input-field w-24">
                                        <option>+60</option>
                                    </select>
                                    <input
                                        type="tel"
                                        value={ewalletDetails.phoneNumber}
                                        onChange={(e) => setEwalletDetails({ ...ewalletDetails, phoneNumber: e.target.value })}
                                        placeholder="12-345 6789"
                                        className="input-field flex-1"
                                    />
                                </div>
                            </div>

                            {/* Account Name */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Account Name *</label>
                                <input
                                    type="text"
                                    value={ewalletDetails.accountName}
                                    onChange={(e) => setEwalletDetails({ ...ewalletDetails, accountName: e.target.value })}
                                    placeholder="Name on e-wallet account"
                                    className="input-field"
                                />
                            </div>

                            {/* QR Code Upload */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Payment QR Code (Optional)</label>
                                <div className="p-6 rounded-xl border-2 border-dashed border-[var(--glass-border)] text-center cursor-pointer hover:border-primary transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                        <Upload className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-sm text-foreground-muted">Click to upload QR code image</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Physical Gift Details */}
                {giftType === "physical" && (
                    <div className="glass-card p-6 animate-fade-in">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Physical Gift Details
                        </h2>
                        <div className="space-y-4">
                            {/* Address */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Delivery Address *</label>
                                <textarea
                                    value={physicalGift.address}
                                    onChange={(e) => setPhysicalGift({ ...physicalGift, address: e.target.value })}
                                    placeholder="Full address including postcode"
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-sm text-foreground-muted block mb-1">Additional Notes</label>
                                <input
                                    type="text"
                                    value={physicalGift.notes}
                                    onChange={(e) => setPhysicalGift({ ...physicalGift, notes: e.target.value })}
                                    placeholder="e.g., Cash only, No flowers please"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview Card */}
                <div className="glass-card p-4 border-info/30 bg-info/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-info" />
                        </div>
                        <p className="text-sm text-foreground-muted">
                            <strong className="text-white">Preview:</strong> This is how your gift section will appear to guests
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 pt-4">
                    <Link href={`/events/${id}/itinerary`} className="btn-secondary flex-1 text-center flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <Link href={`/events/${id}/guests`} className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
                        Continue to Guests
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
