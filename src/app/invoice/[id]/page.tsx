// Server component with edge runtime
// We dynamically import the client component with ssr:false to prevent bundling heavy deps in worker
export const runtime = 'edge';

import dynamic from 'next/dynamic';

// Load client component only in browser - keeps html2canvas/jspdf out of worker
const InvoiceClient = dynamic(() => import('./InvoiceClient'), {
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
    params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: Props) {
    const { id } = await params;
    return <InvoiceClient invoiceId={id} />;
}
