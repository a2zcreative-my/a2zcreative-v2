'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic imports to split code (though bundled in worker, helps local dev)
const BuilderPage = dynamic(() => import('@/views/events/builder'));
const CheckinPage = dynamic(() => import('@/views/events/checkin'));
const ContactPage = dynamic(() => import('@/views/events/contact'));
const GiftPage = dynamic(() => import('@/views/events/gift'));
const GuestsPage = dynamic(() => import('@/views/events/guests'));
const ItineraryPage = dynamic(() => import('@/views/events/itinerary'));
const MusicPage = dynamic(() => import('@/views/events/music'));
const PaymentPage = dynamic(() => import('@/views/events/payment'));
const PreviewPage = dynamic(() => import('@/views/events/preview'));
const ReportPage = dynamic(() => import('@/views/events/report'));
const RsvpPage = dynamic(() => import('@/views/events/rsvp'));
const SectionsPage = dynamic(() => import('@/views/events/sections'));
const SendPage = dynamic(() => import('@/views/events/send'));
const TemplatePage = dynamic(() => import('@/views/events/template'));
const ThemePage = dynamic(() => import('@/views/events/theme'));

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
