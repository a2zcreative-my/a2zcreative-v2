"use client";

import dynamic from 'next/dynamic';

// Dynamic import with ssr:false - must be in a client component
const InvoiceClientComponent = dynamic(() => import('./InvoiceClient'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-white">Loading invoice...</p>
            </div>
        </div>
    ),
});

interface Props {
    invoiceId: string;
}

export default function InvoiceClientWrapper({ invoiceId }: Props) {
    return <InvoiceClientComponent invoiceId={invoiceId} />;
}
