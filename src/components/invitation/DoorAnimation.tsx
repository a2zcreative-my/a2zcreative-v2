"use client";

import { useState } from "react";
import { Mail, Heart, Sparkles } from "lucide-react";

interface DoorAnimationProps {
    coupleName: string;
    eventType: string;
    onOpen: () => void;
}

export default function DoorAnimation({ coupleName, eventType, onOpen }: DoorAnimationProps) {
    const [isOpening, setIsOpening] = useState(false);

    const handleOpen = () => {
        setIsOpening(true);
        // Wait for animation to complete before calling onOpen
        setTimeout(() => {
            onOpen();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Floating Hearts Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <Heart
                        key={i}
                        className="absolute text-primary/10 animate-pulse"
                        style={{
                            width: `${30 + i * 10}px`,
                            height: `${30 + i * 10}px`,
                            left: `${10 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Door Container */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '2000px' }}>
                {/* Left Door */}
                <div
                    className={`absolute left-0 w-1/2 h-full origin-left transition-transform duration-[1.5s] ease-in-out`}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isOpening ? 'rotateY(-110deg)' : 'rotateY(0deg)',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        boxShadow: 'inset -20px 0 60px rgba(0,0,0,0.5), 10px 0 30px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Door Decoration */}
                    <div className="absolute inset-8 border-2 border-primary/30 rounded-lg">
                        <div className="absolute inset-4 border border-primary/20 rounded-lg flex items-center justify-center">
                            <Heart className="w-16 h-16 text-primary/20" />
                        </div>
                    </div>
                    {/* Door Handle */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-16 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-lg" />
                </div>

                {/* Right Door */}
                <div
                    className={`absolute right-0 w-1/2 h-full origin-right transition-transform duration-[1.5s] ease-in-out`}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isOpening ? 'rotateY(110deg)' : 'rotateY(0deg)',
                        background: 'linear-gradient(225deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        boxShadow: 'inset 20px 0 60px rgba(0,0,0,0.5), -10px 0 30px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Door Decoration */}
                    <div className="absolute inset-8 border-2 border-primary/30 rounded-lg">
                        <div className="absolute inset-4 border border-primary/20 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-primary/20" />
                        </div>
                    </div>
                    {/* Door Handle */}
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-16 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-lg" />
                </div>

                {/* Content Overlay (visible before opening) */}
                {!isOpening && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                        {/* Couple Name */}
                        <div className="text-center pointer-events-auto">
                            <p className="text-sm text-primary uppercase tracking-[0.3em] mb-4 animate-pulse">
                                {eventType}
                            </p>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'serif' }}>
                                {coupleName}
                            </h1>

                            {/* Open Button */}
                            <button
                                onClick={handleOpen}
                                className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
                            >
                                <span className="flex items-center gap-3">
                                    <span>Open Invitation</span>
                                    <Mail className="w-6 h-6 group-hover:animate-bounce" />
                                </span>
                                {/* Glow Effect */}
                                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                            </button>

                            <p className="text-foreground-muted text-sm mt-6 flex items-center justify-center gap-2">
                                <span className="animate-bounce">↑</span>
                                Tap to open
                                <span className="animate-bounce">↑</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Light rays during opening */}
            {isOpening && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
            )}
        </div>
    );
}
