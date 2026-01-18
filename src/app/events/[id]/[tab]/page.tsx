'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic imports to split code (though bundled in worker, helps local dev)
// Dynamic imports to split code (though bundled in worker, helps local dev)
const BuilderPage = dynamic(() => import('@/views/events/builder'), { ssr: false });
const CheckinPage = dynamic(() => import('@/views/events/checkin'), { ssr: false });
const ContactPage = dynamic(() => import('@/views/events/contact'), { ssr: false });
const GiftPage = dynamic(() => import('@/views/events/gift'), { ssr: false });
const GuestsPage = dynamic(() => import('@/views/events/guests'), { ssr: false });
const ItineraryPage = dynamic(() => import('@/views/events/itinerary'), { ssr: false });
const MusicPage = dynamic(() => import('@/views/events/music'), { ssr: false });
const PaymentPage = dynamic(() => import('@/views/events/payment'), { ssr: false });
const PreviewPage = dynamic(() => import('@/views/events/preview'), { ssr: false });
const ReportPage = dynamic(() => import('@/views/events/report'), { ssr: false });
const RsvpPage = dynamic(() => import('@/views/events/rsvp'), { ssr: false });
const SectionsPage = dynamic(() => import('@/views/events/sections'), { ssr: false });
const SendPage = dynamic(() => import('@/views/events/send'), { ssr: false });
const TemplatePage = dynamic(() => import('@/views/events/template'), { ssr: false });
const ThemePage = dynamic(() => import('@/views/events/theme'), { ssr: false });

export const runtime = 'edge';

export default function EventTabPage({ params }: { params: Promise<{ tab: string }> }) {
    const { tab } = use(params);

    switch (tab) {
        case 'builder': return <BuilderPage />;
        case 'checkin': return <CheckinPage />;
        case 'contact': return <ContactPage />;
        case 'gift': return <GiftPage />;
        case 'guests': return <GuestsPage />;
        case 'itinerary': return <ItineraryPage />;
        case 'music': return <MusicPage />;
        case 'payment': return <PaymentPage />;
        case 'preview': return <PreviewPage />;
        case 'report': return <ReportPage />;
        case 'rsvp': return <RsvpPage />;
        case 'sections': return <SectionsPage />;
        case 'send': return <SendPage />;
        case 'template': return <TemplatePage />;
        case 'theme': return <ThemePage />;
        default: return notFound();
    }
}
