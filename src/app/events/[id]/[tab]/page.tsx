'use client';

import { use } from 'react';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic imports for pages that are still separate
const CheckinPage = dynamic(() => import('@/views/events/checkin'), { ssr: false });
const GuestsPage = dynamic(() => import('@/views/events/guests'), { ssr: false });
const ReportPage = dynamic(() => import('@/views/events/report'), { ssr: false });
const RsvpPage = dynamic(() => import('@/views/events/rsvp'), { ssr: false });

export const runtime = 'edge';

// Old builder step tabs - redirect to unified builder
const BUILDER_TABS = ['template', 'theme', 'music', 'sections', 'contact', 'itinerary', 'gift', 'preview', 'payment', 'send', 'builder'];

export default function EventTabPage({ params }: { params: Promise<{ id: string; tab: string }> }) {
    const { id, tab } = use(params);

    // Redirect old builder steps to unified builder
    if (BUILDER_TABS.includes(tab)) {
        redirect(`/events/${id}/builder`);
    }

    switch (tab) {
        case 'checkin': return <CheckinPage />;
        case 'guests': return <GuestsPage />;
        case 'report': return <ReportPage />;
        case 'rsvp': return <RsvpPage />;
        default: return notFound();
    }
}
