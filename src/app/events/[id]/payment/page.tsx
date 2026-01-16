"use client";

import Link from "next/link";
import { useState, use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import StepIndicator from "@/components/StepIndicator";

const orderDetails = {
    plan: "Premium Pack",
    planPrice: 99,
    addons: [
        { name: "Extra 100 guests", price: 20 },
        { name: "Custom domain", price: 15 },
    ],
};

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Check for payment failure from redirect
    const paymentStatus = searchParams.get('payment');

    useEffect(() => {
        if (paymentStatus === 'failed') {
            setError('Payment was not completed. Please try again.');
        }
    }, [paymentStatus]);

    const subtotal = orderDetails.planPrice + orderDetails.addons.reduce((sum, a) => sum + a.price, 0);
    const discount = 0;
    const total = subtotal - discount;

    const handlePayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Create Billplz bill via our secure API
            const response = await fetch('/api/payment/create-bill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: id,
                    amount: total * 100, // Convert to cents
                    email: 'customer@example.com', // TODO: Get from user profile
                    name: 'Event Organizer', // TODO: Get from user profile
                    phone: '+60123456789', // TODO: Get from user profile
                    description: `A2ZCreative - ${orderDetails.plan} for Event #${id}`,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment');
            }

            // Redirect to Billplz payment page
            window.location.href = data.billUrl;

        } catch (err) {
            console.error('Payment error:', err);
            setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={10} eventId={id} />

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href={`/events/${id}/preview`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    ← Back to Preview
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Complete Payment</h1>
                <p className="text-foreground-muted">Pay securely via Billplz</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-4xl mx-auto mb-6">
                    <div className="glass-card p-4 border-error/30 bg-error/10">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="text-error">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Info */}
                <div className="space-y-6">
                    {/* Billplz Info */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">💳</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Pay with Billplz</h2>
                                <p className="text-sm text-foreground-muted">FPX, Credit Card, E-Wallets</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-background-tertiary rounded-lg text-center">
                                <span className="text-xl">🏦</span>
                                <p className="text-xs text-foreground-muted mt-1">FPX</p>
                            </div>
                            <div className="p-3 bg-background-tertiary rounded-lg text-center">
                                <span className="text-xl">💳</span>
                                <p className="text-xs text-foreground-muted mt-1">Card</p>
                            </div>
                            <div className="p-3 bg-background-tertiary rounded-lg text-center">
                                <span className="text-xl">📱</span>
                                <p className="text-xs text-foreground-muted mt-1">E-Wallet</p>
                            </div>
                        </div>
                    </div>

                    {/* Promo Code */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Promo Code</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter promo code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="input-field flex-1"
                            />
                            <button className="btn-secondary">Apply</button>
                        </div>
                    </div>

                    {/* Sandbox Notice */}
                    <div className="glass-card p-4 border-warning/30 bg-warning/10">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🧪</span>
                            <div>
                                <p className="text-warning font-medium">Sandbox Mode</p>
                                <p className="text-xs text-foreground-muted">This is a test payment. No real money will be charged.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="glass-card p-6 sticky top-8">
                        <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>

                        {/* Plan */}
                        <div className="flex justify-between items-center py-3 border-b border-[var(--glass-border)]">
                            <div>
                                <p className="text-white font-medium">{orderDetails.plan}</p>
                                <p className="text-sm text-foreground-muted">Digital Invitation Package</p>
                            </div>
                            <p className="text-white font-semibold">RM {orderDetails.planPrice}</p>
                        </div>

                        {/* Add-ons */}
                        {orderDetails.addons.map((addon) => (
                            <div key={addon.name} className="flex justify-between items-center py-3 border-b border-[var(--glass-border)]">
                                <p className="text-foreground-muted">{addon.name}</p>
                                <p className="text-white">RM {addon.price}</p>
                            </div>
                        ))}

                        {/* Discount */}
                        {discount > 0 && (
                            <div className="flex justify-between items-center py-3 border-b border-[var(--glass-border)]">
                                <p className="text-success">Discount</p>
                                <p className="text-success">-RM {discount}</p>
                            </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center py-4">
                            <p className="text-xl font-bold text-white">Total</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                RM {total}
                            </p>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`btn-primary w-full mt-4 ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Connecting to Billplz...
                                </span>
                            ) : (
                                `Pay RM ${total} with Billplz`
                            )}
                        </button>

                        {/* Security Note */}
                        <p className="text-xs text-foreground-muted text-center mt-4">
                            🔒 Secured by Billplz. Your payment is safe.
                        </p>

                        {/* Billplz Logo */}
                        <div className="flex justify-center mt-4 pt-4 border-t border-[var(--glass-border)]">
                            <div className="text-xs text-foreground-muted">
                                Powered by <span className="text-primary font-semibold">Billplz</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
