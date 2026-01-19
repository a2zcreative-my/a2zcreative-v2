"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-[var(--glass-border)] py-4"
                    : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 relative z-50">
                    <Image
                        src="/logo.png"
                        alt="A2ZCreative"
                        width={32}
                        height={32}
                        className="rounded-lg"
                    />
                    <span className="text-xl font-bold text-white">A2ZCreative</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#features"
                        className="text-foreground-muted hover:text-white transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#pricing"
                        className="text-foreground-muted hover:text-white transition-colors"
                    >
                        Pricing
                    </a>
                    <a
                        href="#testimonials"
                        className="text-foreground-muted hover:text-white transition-colors"
                    >
                        Testimonials
                    </a>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/auth/login"
                        className="text-foreground-muted hover:text-white transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/register"
                        className="btn-primary text-sm px-4 py-2"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden relative z-50 p-2 text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 bg-background/95 backdrop-blur-lg z-40 transition-transform duration-300 md:hidden flex flex-col items-center justify-center gap-8 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="flex flex-col items-center gap-6 text-xl">
                        <a
                            href="#features"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-foreground-muted hover:text-white transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#pricing"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-foreground-muted hover:text-white transition-colors"
                        >
                            Pricing
                        </a>
                        <a
                            href="#testimonials"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-foreground-muted hover:text-white transition-colors"
                        >
                            Testimonials
                        </a>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full px-12">
                        <Link
                            href="/auth/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-foreground-muted hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="btn-primary w-full text-center py-3"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
