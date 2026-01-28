import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A2ZCreative - Beautiful Digital Invitations for Events",
  description: "Create beautiful digital invitations for your special events. Wedding, Birthday, Corporate & more.",
  keywords: ["digital invitation", "e-kad", "wedding invitation", "event management", "Malaysia"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  metadataBase: new URL("https://a2zcreative.com.my"),
  openGraph: {
    title: "A2ZCreative - Beautiful Digital Invitations for Events",
    description: "Create beautiful digital invitations for weddings, birthdays, corporate events & more. Share via WhatsApp, track RSVPs instantly.",
    url: "https://a2zcreative.com.my",
    siteName: "A2ZCreative",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "A2ZCreative - Create Beautiful Digital Invitations",
      },
    ],
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A2ZCreative - Beautiful Digital Invitations for Events",
    description: "Create beautiful digital invitations for weddings, birthdays, corporate events & more.",
    images: ["/og-image.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
