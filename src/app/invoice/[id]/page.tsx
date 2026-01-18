// Server component with edge runtime - minimal wrapper
export const runtime = 'edge';

import InvoiceClientWrapper from './InvoiceClientWrapper';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: Props) {
    const { id } = await params;
    return <InvoiceClientWrapper invoiceId={id} />;
}
