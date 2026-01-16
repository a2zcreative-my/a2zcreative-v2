"use client";

import { useState, useRef, useEffect } from 'react';
import { notFound } from 'next/navigation';
import DoorAnimation from '@/components/invitation/DoorAnimation';
import InvitationSections from '@/components/invitation/InvitationSections';
import FloatingDock from '@/components/invitation/FloatingDock';
import ContactModal from '@/components/invitation/ContactModal';

// This would come from your database in production
const mockInvitations: Record<string, {
    eventType: string;
    couple: { name1: string; name2: string };
    date: string;
    time: string;
    parents: {
        bride: { father: string; mother: string };
        groom: { father: string; mother: string };
    };
    itinerary: Array<{ time: string; event: string }>;
    venue: {
        name: string;
        address: string;
        googleMapsUrl: string;
        wazeUrl: string;
        embedUrl: string;
    };
    contacts: Array<{ name: string; phone: string; role: string; whatsapp: boolean }>;
    theme: { primary: string; secondary: string };
    musicUrl?: string;
}> = {
    'ahmad-alia': {
        eventType: 'Majlis Perkahwinan',
        couple: { name1: 'Ahmad', name2: 'Alia' },
        date: '15 February 2026',
        time: '12:00 PM - 4:00 PM',
        parents: {
            bride: { father: 'Encik Razali bin Ahmad', mother: 'Puan Siti binti Hassan' },
            groom: { father: 'Encik Ahmad bin Ali', mother: 'Puan Fatimah binti Osman' },
        },
        itinerary: [
            { time: '11:00 AM', event: 'Ketibaan Tetamu' },
            { time: '12:00 PM', event: 'Ketibaan Pengantin' },
            { time: '12:30 PM', event: 'Majlis Makan Beradab' },
            { time: '2:00 PM', event: 'Sesi Fotografi' },
            { time: '3:30 PM', event: 'Majlis Bersurai' },
        ],
        venue: {
            name: 'Dewan Seri Endon, PWTC',
            address: 'Jalan Tun Ismail, 50480 Kuala Lumpur',
            googleMapsUrl: 'https://maps.google.com/?q=PWTC+Kuala+Lumpur',
            wazeUrl: 'https://waze.com/ul?q=PWTC+Kuala+Lumpur',
            embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.7660736855775!2d101.68904!3d3.1636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc49c701efeae7%3A0xf4d98e5b2f1c287d!2sPutra%20World%20Trade%20Centre!5e0!3m2!1sen!2smy!4v1234567890',
        },
        contacts: [
            { name: 'Encik Ahmad', phone: '+60123456789', role: 'Father of Groom', whatsapp: true },
            { name: 'Puan Siti', phone: '+60198765432', role: 'Mother of Bride', whatsapp: true },
        ],
        theme: { primary: '#D4AF37', secondary: '#8B7355' },
        musicUrl: '/audio/wedding-music.mp3',
    },
    'hafiz-nadia': {
        eventType: 'Walimatul Urus',
        couple: { name1: 'Hafiz', name2: 'Nadia' },
        date: '22 March 2026',
        time: '11:00 AM - 3:00 PM',
        parents: {
            bride: { father: 'Encik Kamal bin Yusof', mother: 'Puan Zainab binti Rahim' },
            groom: { father: 'Encik Razak bin Ismail', mother: 'Puan Aminah binti Zakaria' },
        },
        itinerary: [
            { time: '10:30 AM', event: 'Ketibaan Tetamu' },
            { time: '11:00 AM', event: 'Akad Nikah' },
            { time: '12:00 PM', event: 'Makan Tengahari' },
            { time: '2:00 PM', event: 'Sesi Bergambar' },
        ],
        venue: {
            name: 'Dewan Komuniti Taman Melati',
            address: 'Jalan Melati, Taman Melati, Kuala Lumpur',
            googleMapsUrl: 'https://maps.google.com/?q=Taman+Melati+KL',
            wazeUrl: 'https://waze.com/ul?q=Taman+Melati+KL',
            embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.5!2d101.7!3d3.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMTInMDAuMCJOIDEwMcKwNDInMDAuMCJF!5e0!3m2!1sen!2smy!4v1234567890',
        },
        contacts: [
            { name: 'Encik Razak', phone: '+60112223333', role: 'Father of Groom', whatsapp: true },
            { name: 'Puan Zainab', phone: '+60134445555', role: 'Mother of Bride', whatsapp: true },
        ],
        theme: { primary: '#E8B4B8', secondary: '#9C6B6B' },
    },
};

interface Props {
    params: Promise<{ slug: string }>;
}

export default function PublicInvitationPage({ params }: Props) {
    const [slug, setSlug] = useState<string | null>(null);
    const [showDoor, setShowDoor] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Resolve params
    useEffect(() => {
        params.then(p => setSlug(p.slug));
    }, [params]);

    // Handle music toggle
    const toggleMusic = () => {
        if (audioRef.current) {
            if (isMusicPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(console.error);
            }
            setIsMusicPlaying(!isMusicPlaying);
        }
    };

    if (!slug) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    const invitation = mockInvitations[slug];

    if (!invitation) {
        notFound();
    }

    const handleDoorOpen = () => {
        setShowDoor(false);
        // Auto-play music when door opens (if available)
        if (invitation.musicUrl && audioRef.current) {
            audioRef.current.play().catch(console.error);
            setIsMusicPlaying(true);
        }
    };

    return (
        <>
            {/* Background Music */}
            {invitation.musicUrl && (
                <audio ref={audioRef} loop>
                    <source src={invitation.musicUrl} type="audio/mpeg" />
                </audio>
            )}

            {/* Door Animation */}
            {showDoor && (
                <DoorAnimation
                    coupleName={`${invitation.couple.name1} & ${invitation.couple.name2}`}
                    eventType={invitation.eventType}
                    onOpen={handleDoorOpen}
                />
            )}

            {/* Main Invitation Content */}
            {!showDoor && (
                <>
                    <InvitationSections data={invitation} />

                    <FloatingDock
                        onContactClick={() => setShowContactModal(true)}
                        onMusicToggle={toggleMusic}
                        isMusicPlaying={isMusicPlaying}
                    />

                    <ContactModal
                        isOpen={showContactModal}
                        onClose={() => setShowContactModal(false)}
                        contacts={invitation.contacts}
                    />
                </>
            )}
        </>
    );
}

export const runtime = 'edge';
