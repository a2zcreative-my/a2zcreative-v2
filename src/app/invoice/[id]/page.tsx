"use client";

// Note: This is a client component - no edge runtime needed

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { ArrowLeft, Download, Printer, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";

// Company details
const COMPANY = {
    name: "A 2 Z CREATIVE MARKETING",
    regNo: "202603003468 (CA0414729-A)",
    address: "12-02-08, PERSIARAN INDAHPURA 6,\nTEMENGGONG 12 (BLOK 12), INDAHPURA,\n81000 KULAI, JOHOR",
    email: "support@a2zcreative.com.my",
    website: "www.a2zcreative.com.my"
};

interface Invoice {
    id: string;
    invoiceNo: string; // We'll map id to this
    date: string;
    dueDate: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    status: "paid" | "pending" | "overdue";
    paymentMethod: string;
    paidDate?: string;
}

interface Props {
    params: Promise<{ id: string }>;
}

export default function InvoicePage({ params }: Props) {
    const resolvedParams = use(params);
    const router = useRouter();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // If it's a mock ID (1, 2, 3) from legacy, we can't really fetch it.
                // But let's try to fetch from API anyway.
                const res = await fetch(`/api/invoices/${resolvedParams.id}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        // Fallback for demo/testing if we still want to show something?
                        // For now, let's treat it as real error
                        throw new Error('Invoice not found');
                    }
                    throw new Error('Failed to load invoice');
                }

                const data = await res.json();

                // Map API data to UI format
                const mappedInvoice: Invoice = {
                    id: data.id,
                    invoiceNo: data.id,
                    date: new Date(data.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    dueDate: data.due_date ? new Date(data.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
                    customer: {
                        name: data.customer_name || 'Guest',
                        email: data.customer_email || '-',
                        phone: data.customer_phone || '-'
                    },
                    items: data.items, // Already parsed in API
                    subtotal: data.amount,
                    tax: 0, // Simplified for now
                    total: data.amount,
                    status: data.status as "paid" | "pending" | "overdue",
                    paymentMethod: data.payment_method || '-',
                    paidDate: data.paid_at ? new Date(data.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined
                };

                setInvoice(mappedInvoice);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Error loading invoice');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-white">Loading invoice...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !invoice) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <h1 className="text-2xl font-bold text-white mb-4">Invoice Not Found</h1>
                    <p className="text-white/60 mb-6">{error || "The requested invoice does not exist."}</p>
                    <button onClick={() => router.back()} className="btn-primary">
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;

        setIsDownloading(true);

        try {
            // Dynamic imports for client-side only
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${invoice.invoiceNo}.pdf`);

            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 2000);
        } catch (error) {
            console.error('PDF generation error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-foreground-muted hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Billing
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="btn-primary flex items-center gap-2"
                        >
                            {downloadSuccess ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Downloaded!
                                </>
                            ) : isDownloading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Invoice Document */}
                <div
                    ref={invoiceRef}
                    className="rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto print:shadow-none print:rounded-none"
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#111827',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                >
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(to right, #1a1a2e, #16213e)', color: '#ffffff', padding: '32px' }}>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                            <div>
                                <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>INVOICE</h1>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>{invoice.invoiceNo}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>{COMPANY.name}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>NO. PENDAFTARAN: {COMPANY.regNo}</p>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', whiteSpace: 'pre-line', marginTop: '8px' }}>{COMPANY.address}</p>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '8px' }}>{COMPANY.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div style={{ padding: '32px' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Bill To */}
                            <div>
                                <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Bill To</h3>
                                <p style={{ fontWeight: '600', fontSize: '18px', color: '#111827' }}>{invoice.customer.name}</p>
                                <p style={{ color: '#4b5563' }}>{invoice.customer.email}</p>
                                <p style={{ color: '#4b5563' }}>{invoice.customer.phone}</p>
                            </div>

                            {/* Invoice Info */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                        <span style={{ color: '#6b7280' }}>Invoice Date:</span>
                                        <span style={{ fontWeight: '500', color: '#111827' }}>{invoice.date}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                        <span style={{ color: '#6b7280' }}>Due Date:</span>
                                        <span style={{ fontWeight: '500', color: '#111827' }}>{invoice.dueDate}</span>
                                    </div>
                                    {invoice.paidDate && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                            <span style={{ color: '#6b7280' }}>Paid Date:</span>
                                            <span style={{ fontWeight: '500', color: '#16a34a' }}>{invoice.paidDate}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            backgroundColor: invoice.status === 'paid' ? '#dcfce7' : invoice.status === 'pending' ? '#fef9c3' : '#fee2e2',
                                            color: invoice.status === 'paid' ? '#166534' : invoice.status === 'pending' ? '#854d0e' : '#991b1b'
                                        }}>
                                            {invoice.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Description</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Qty</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Unit Price</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderTop: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '16px 24px', color: '#111827' }}>{item.description}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'center', color: '#4b5563' }}>{item.quantity}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', color: '#4b5563' }}>RM {item.unitPrice.toFixed(2)}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '500', color: '#111827' }}>RM {item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '320px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                    <span style={{ color: '#4b5563' }}>Subtotal</span>
                                    <span style={{ fontWeight: '500', color: '#111827' }}>RM {invoice.subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                    <span style={{ color: '#4b5563' }}>Tax (0%)</span>
                                    <span style={{ fontWeight: '500', color: '#111827' }}>RM {invoice.tax.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f9fafb', marginTop: '8px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Total</span>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e' }}>RM {invoice.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        {invoice.status === 'paid' && (
                            <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} />
                                    <div>
                                        <p style={{ fontWeight: '600', color: '#166534' }}>Payment Received</p>
                                        <p style={{ fontSize: '14px', color: '#15803d' }}>
                                            Paid on {invoice.paidDate} via {invoice.paymentMethod}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                            <p style={{ marginBottom: '8px' }}>Thank you for choosing {COMPANY.name}!</p>
                            <p>For any enquiries, please contact us at {COMPANY.email}</p>
                            <p style={{ marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>
                                This is a computer-generated invoice. No signature is required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
