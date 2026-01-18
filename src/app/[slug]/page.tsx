"use client";

import { useState, useRef, useEffect } from 'react';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const DoorAnimation = dynamic(() => import('@/components/invitation/DoorAnimation'), { ssr: false });
const InvitationSections = dynamic(() => import('@/components/invitation/InvitationSections'), { ssr: false });
const FloatingDock = dynamic(() => import('@/components/invitation/FloatingDock'), { ssr: false });
const ContactModal = dynamic(() => import('@/components/invitation/ContactModal'), { ssr: false });

import { mockInvitations } from '@/data/invitations';

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
        if (slug === 'login') redirect('/auth/login');
        if (slug === 'register') redirect('/auth/register');
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
                    <InvitationSections data={invitation} eventSlug={slug} />

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
