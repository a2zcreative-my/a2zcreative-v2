// Server component with edge runtime - thin wrapper for client component
export const runtime = 'edge';

import InvoiceClient from './InvoiceClient';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: Props) {
    const { id } = await params;
    return <InvoiceClient invoiceId={id} />;
}
