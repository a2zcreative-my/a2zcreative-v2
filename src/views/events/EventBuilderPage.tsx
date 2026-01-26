"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ChevronDown,
    ChevronUp,
    Check,
    Sparkles,
    Flower2,
    Square,
    Crown,
    Palmtree,
    Building2,
    Leaf,
    Moon,
    TreeDeciduous,
    PartyPopper,
    Star,
    Gem,
    Palette,
    PenTool,
    Image,
    Music,
    VolumeX,
    Play,
    Pause,
    MapPin,
    Calendar,
    User,
    Gift,
    Video,
    Clock,
    MessageSquare,
    MessageCircle,
    Trash2,
    Plus,
    GripVertical,
    Lightbulb,
    Landmark,
    Smartphone,
    Package,
    Upload,
    Eye,
    Laptop,
    Pencil,
    Church,
    Maximize,
    CreditCard,
    AlertTriangle,
    FlaskConical,
    Lock,
    Loader2,
    Mail,
    LinkIcon,
    Facebook,
    Twitter,
    Rocket,
    Copy,
    ArrowLeft,
    ArrowRight,
    Phone,
    X,
    Navigation,
    type LucideIcon,
} from "lucide-react";
import TimePicker from "@/components/ui/TimePicker";

// ============= TYPES =============
interface EventData {
    // Template
    selectedTemplate: string | null;
    templateCategory: string;
    // Theme
    colorPalette: string;
    fontStyle: string;
    backgroundStyle: string;
    doorAnimation: string;
    // Music
    musicEnabled: boolean;
    selectedMusic: string | null;
    autoMute: boolean;
    // Sections
    enabledSections: Record<string, boolean>;
    // Contact
    contacts: Contact[];
    // Itinerary
    itinerary: ItineraryItem[];
    // Gift
    giftType: string;
    bankDetails: BankDetails;
    ewalletDetails: EwalletDetails;
    physicalGift: PhysicalGift;
    // Event Details (from /events/create/details)
    eventName: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    address: string;
    hostName: string;
    coupleName1: string;
    coupleName2: string;
    celebrantName: string;
    companyName: string;
    parentsBride: string;
    parentsGroom: string;
    description: string;
    eventType: string;
    bridePhoto: string | null;
    groomPhoto: string | null;
    celebrantPhoto: string | null;
    babyPhoto: string | null;
    logoPhoto: string | null;
    hostPhoto: string | null;
}

interface Contact {
    id: string;
    name: string;
    phone: string;
    countryCode: string;
    role: string;
    showWhatsApp: boolean;
}

interface ItineraryItem {
    id: string;
    time: string;
    activity: string;
    location: string;
}

interface BankDetails {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

interface EwalletDetails {
    provider: string;
    phoneNumber: string;
    accountName: string;
}

interface PhysicalGift {
    address: string;
    notes: string;
}

// ============= CONSTANTS =============
const STEPS = [
    { id: 1, name: "Template", key: "template" },
    { id: 2, name: "Theme", key: "theme" },
    { id: 3, name: "Music", key: "music" },
    { id: 4, name: "Sections", key: "sections" },
    { id: 5, name: "Contact", key: "contact" },
    { id: 6, name: "Itinerary", key: "itinerary" },
    { id: 7, name: "Gift", key: "gift" },
    { id: 8, name: "Preview", key: "preview" },
    { id: 9, name: "Payment", key: "payment" },
    { id: 10, name: "Send", key: "send" },
];

const templateIcons: Record<string, LucideIcon> = {
    // Wedding
    "elegant-gold": Sparkles,
    "floral-blush": Flower2,
    "rustic-charm": TreeDeciduous,
    "classic-white": Square,
    "romantic-rose": Flower2,
    "garden-romance": Leaf,
    "vintage-lace": Star,
    "modern-love": Gem,
    // Birthday
    "tropical-vibes": Palmtree,
    "kids-fun": PartyPopper,
    "neon-party": Sparkles,
    "balloon-bash": PartyPopper,
    "elegant-celebration": Crown,
    "milestone-gold": Sparkles,
    "sweet-sixteen": Star,
    "disco-glam": Moon,
    // Corporate
    "corporate-blue": Building2,
    "professional-gray": Square,
    "tech-modern": Gem,
    "executive-black": Square,
    "startup-fresh": Leaf,
    "conference-gold": Crown,
    // Religious
    "islamic-art": Star,
    "islamic-green": Leaf,
    "islamic-gold": Sparkles,
    "christian-cross": Star,
    "hindu-mandala": Flower2,
    "buddhist-lotus": Flower2,
    // Baby Shower
    "baby-blue": Flower2,
    "baby-pink": Flower2,
    "teddy-bears": PartyPopper,
    "stork-delivery": Leaf,
    "twinkle-stars": Star,
    "safari-animals": Palmtree,
    // Graduation
    "grad-classic": Crown,
    "grad-modern": Square,
    "school-colors": Building2,
    "achievement-gold": Sparkles,
    // Anniversary
    "silver-anniversary": Gem,
    "golden-years": Sparkles,
    "ruby-celebration": Gem,
    "eternal-love": Flower2,
    // Engagement
    "ring-sparkle": Gem,
    "proposal-blush": Flower2,
    "love-story": Star,
    // VIP/Gala
    "royal-purple": Crown,
    "night-gala": Moon,
    "luxury-black": Gem,
    "red-carpet": Crown,
};

const templates = [
    // ===== WEDDING (8 templates) =====
    { id: "elegant-gold", name: "Elegant Gold", category: "Wedding", tier: "premium", description: "Luxurious gold accents with sophisticated design" },
    { id: "floral-blush", name: "Floral Blush", category: "Wedding", tier: "basic", description: "Soft pink florals with romantic vibes" },
    { id: "rustic-charm", name: "Rustic Charm", category: "Wedding", tier: "premium", description: "Warm wood textures with natural elements" },
    { id: "classic-white", name: "Classic White", category: "Wedding", tier: "starter", description: "Timeless white elegance" },
    { id: "romantic-rose", name: "Romantic Rose", category: "Wedding", tier: "basic", description: "Beautiful rose patterns with love themes" },
    { id: "garden-romance", name: "Garden Romance", category: "Wedding", tier: "premium", description: "Lush garden florals and greenery" },
    { id: "vintage-lace", name: "Vintage Lace", category: "Wedding", tier: "exclusive", description: "Delicate lace patterns with vintage charm" },
    { id: "modern-love", name: "Modern Love", category: "Wedding", tier: "basic", description: "Clean contemporary wedding design" },

    // ===== BIRTHDAY (8 templates) =====
    { id: "tropical-vibes", name: "Tropical Vibes", category: "Birthday", tier: "starter", description: "Fun tropical theme with palm leaves" },
    { id: "kids-fun", name: "Kids Fun", category: "Birthday", tier: "starter", description: "Colorful and playful for children" },
    { id: "neon-party", name: "Neon Party", category: "Birthday", tier: "basic", description: "Vibrant neon colors for party lovers" },
    { id: "balloon-bash", name: "Balloon Bash", category: "Birthday", tier: "starter", description: "Festive balloons and confetti" },
    { id: "elegant-celebration", name: "Elegant Celebration", category: "Birthday", tier: "premium", description: "Sophisticated adult birthday style" },
    { id: "milestone-gold", name: "Milestone Gold", category: "Birthday", tier: "premium", description: "Special milestone birthdays (30th, 50th, etc.)" },
    { id: "sweet-sixteen", name: "Sweet Sixteen", category: "Birthday", tier: "basic", description: "Perfect for sweet 16 celebrations" },
    { id: "disco-glam", name: "Disco Glam", category: "Birthday", tier: "basic", description: "Sparkly disco-themed party vibes" },

    // ===== CORPORATE (6 templates) =====
    { id: "corporate-blue", name: "Corporate Blue", category: "Corporate", tier: "basic", description: "Professional blue business style" },
    { id: "professional-gray", name: "Professional Gray", category: "Corporate", tier: "starter", description: "Clean minimal corporate design" },
    { id: "tech-modern", name: "Tech Modern", category: "Corporate", tier: "premium", description: "Modern tech company aesthetic" },
    { id: "executive-black", name: "Executive Black", category: "Corporate", tier: "exclusive", description: "Premium executive event style" },
    { id: "startup-fresh", name: "Startup Fresh", category: "Corporate", tier: "basic", description: "Fresh and modern startup vibes" },
    { id: "conference-gold", name: "Conference Gold", category: "Corporate", tier: "premium", description: "Grand conference and summit style" },

    // ===== RELIGIOUS (6 templates) =====
    { id: "islamic-art", name: "Islamic Art", category: "Religious", tier: "basic", description: "Beautiful Islamic geometric patterns" },
    { id: "islamic-green", name: "Islamic Green", category: "Religious", tier: "starter", description: "Traditional green Islamic theme" },
    { id: "islamic-gold", name: "Islamic Gold", category: "Religious", tier: "premium", description: "Elegant gold Islamic calligraphy" },
    { id: "christian-cross", name: "Christian Grace", category: "Religious", tier: "basic", description: "Elegant Christian-themed design" },
    { id: "hindu-mandala", name: "Hindu Mandala", category: "Religious", tier: "premium", description: "Colorful mandala patterns" },
    { id: "buddhist-lotus", name: "Buddhist Lotus", category: "Religious", tier: "basic", description: "Serene lotus flower theme" },

    // ===== BABY SHOWER (6 templates) =====
    { id: "baby-blue", name: "Baby Blue", category: "Baby Shower", tier: "starter", description: "Classic blue for baby boys" },
    { id: "baby-pink", name: "Baby Pink", category: "Baby Shower", tier: "starter", description: "Sweet pink for baby girls" },
    { id: "teddy-bears", name: "Teddy Bears", category: "Baby Shower", tier: "basic", description: "Adorable teddy bear theme" },
    { id: "stork-delivery", name: "Stork Delivery", category: "Baby Shower", tier: "basic", description: "Classic stork delivery design" },
    { id: "twinkle-stars", name: "Twinkle Stars", category: "Baby Shower", tier: "premium", description: "Magical twinkle little star theme" },
    { id: "safari-animals", name: "Safari Animals", category: "Baby Shower", tier: "premium", description: "Cute safari animal theme" },

    // ===== GRADUATION (4 templates) =====
    { id: "grad-classic", name: "Graduation Classic", category: "Graduation", tier: "basic", description: "Traditional cap and gown theme" },
    { id: "grad-modern", name: "Graduation Modern", category: "Graduation", tier: "starter", description: "Contemporary graduation style" },
    { id: "school-colors", name: "School Colors", category: "Graduation", tier: "basic", description: "Customizable school colors theme" },
    { id: "achievement-gold", name: "Achievement Gold", category: "Graduation", tier: "premium", description: "Celebratory gold achievement style" },

    // ===== ANNIVERSARY (4 templates) =====
    { id: "silver-anniversary", name: "Silver Anniversary", category: "Anniversary", tier: "basic", description: "Elegant silver 25th anniversary" },
    { id: "golden-years", name: "Golden Years", category: "Anniversary", tier: "premium", description: "Luxurious 50th golden anniversary" },
    { id: "ruby-celebration", name: "Ruby Celebration", category: "Anniversary", tier: "premium", description: "Beautiful ruby 40th anniversary" },
    { id: "eternal-love", name: "Eternal Love", category: "Anniversary", tier: "basic", description: "Romantic anniversary celebration" },

    // ===== ENGAGEMENT (3 templates) =====
    { id: "ring-sparkle", name: "Ring Sparkle", category: "Engagement", tier: "premium", description: "Sparkling diamond ring theme" },
    { id: "proposal-blush", name: "Proposal Blush", category: "Engagement", tier: "basic", description: "Romantic blush engagement style" },
    { id: "love-story", name: "Love Story", category: "Engagement", tier: "basic", description: "Beautiful love story narrative" },

    // ===== VIP/GALA (4 templates) =====
    { id: "royal-purple", name: "Royal Purple", category: "VIP", tier: "exclusive", description: "Regal purple VIP experience" },
    { id: "night-gala", name: "Night Gala", category: "VIP", tier: "premium", description: "Glamorous evening gala theme" },
    { id: "luxury-black", name: "Luxury Black", category: "VIP", tier: "exclusive", description: "Ultra-premium black tie style" },
    { id: "red-carpet", name: "Red Carpet", category: "VIP", tier: "exclusive", description: "Hollywood red carpet glamour" },

    // ===== ALL (general purpose) =====
    { id: "modern-minimal", name: "Modern Minimal", category: "All", tier: "starter", description: "Clean minimal design for any event" },
    { id: "garden-party", name: "Garden Party", category: "All", tier: "basic", description: "Versatile garden party theme" },
];

const templateCategories = ["All", "Wedding", "Birthday", "Corporate", "Religious", "Baby Shower", "Graduation", "Anniversary", "Engagement", "VIP"];

const colorPalettes = [
    { id: "gold-elegant", name: "Gold Elegant", colors: ["#D4AF37", "#1a1a24", "#ffffff", "#f5f5dc"] },
    { id: "blush-romance", name: "Blush Romance", colors: ["#FFB6C1", "#FFF0F5", "#8B4557", "#ffffff"] },
    { id: "ocean-blue", name: "Ocean Blue", colors: ["#0077B6", "#00B4D8", "#90E0EF", "#ffffff"] },
    { id: "forest-green", name: "Forest Green", colors: ["#228B22", "#2D5A27", "#90EE90", "#ffffff"] },
    { id: "royal-purple", name: "Royal Purple", colors: ["#6A0DAD", "#9B30FF", "#E6E6FA", "#ffffff"] },
    { id: "midnight-dark", name: "Midnight Dark", colors: ["#0a0a12", "#6366f1", "#8b5cf6", "#ffffff"] },
];

const fontStyles = [
    { id: "classic", name: "Classic Serif", family: "Playfair Display, serif" },
    { id: "modern", name: "Modern Sans", family: "Poppins, sans-serif" },
    { id: "elegant", name: "Elegant Script", family: "Dancing Script, cursive" },
    { id: "minimal", name: "Minimal Clean", family: "Inter, sans-serif" },
];

const backgrounds = [
    { id: "solid", name: "Solid Color", type: "static" },
    { id: "gradient", name: "Gradient", type: "static" },
    { id: "pattern", name: "Subtle Pattern", type: "static" },
    { id: "floral", name: "Floral Overlay", type: "static" },
];

const musicLibrary = [
    { id: "romantic-piano", name: "Romantic Piano", duration: "3:24", category: "Wedding" },
    { id: "acoustic-love", name: "Acoustic Love", duration: "2:58", category: "Wedding" },
    { id: "traditional-malay", name: "Traditional Malay", duration: "3:45", category: "Cultural" },
    { id: "happy-birthday", name: "Happy Celebration", duration: "2:30", category: "Birthday" },
    { id: "corporate-inspire", name: "Corporate Inspire", duration: "3:00", category: "Corporate" },
    { id: "gentle-strings", name: "Gentle Strings", duration: "3:35", category: "All" },
];

const sectionOptions = [
    { id: "location", name: "Location & Map", description: "Venue with Google Maps", required: true },
    { id: "itinerary", name: "Itinerary / Tentative", description: "Event timeline schedule" },
    { id: "contact", name: "Contact Person", description: "WhatsApp click-to-chat" },
    { id: "gift", name: "Gift / Bank Details", description: "Bank transfer & e-wallet info" },
    { id: "gallery", name: "Photo Gallery", description: "Upload event photos", premium: true },
    { id: "video", name: "Video Section", description: "Embed YouTube / upload video", premium: true },
    { id: "countdown", name: "Countdown Timer", description: "Days until event" },
    { id: "wishes", name: "Guest Wishes", description: "Let guests leave messages" },
];

const sectionIcons: Record<string, LucideIcon> = {
    location: MapPin,
    itinerary: Calendar,
    contact: User,
    gift: Gift,
    gallery: Image,
    video: Video,
    countdown: Clock,
    wishes: MessageSquare,
};

const malaysianBanks = [
    { name: "Maybank", color: "#FFC72C", textColor: "#000000" },
    { name: "CIMB Bank", color: "#ED1C24", textColor: "#ffffff" },
    { name: "Public Bank", color: "#E31837", textColor: "#ffffff" },
    { name: "RHB Bank", color: "#0066B3", textColor: "#ffffff" },
    { name: "Hong Leong Bank", color: "#005B9F", textColor: "#ffffff" },
    { name: "AmBank", color: "#ED1C24", textColor: "#ffffff" },
    { name: "Bank Islam", color: "#00A651", textColor: "#ffffff" },
    { name: "Bank Rakyat", color: "#003D7C", textColor: "#ffffff" },
    { name: "BSN", color: "#0072BC", textColor: "#ffffff" },
    { name: "Affin Bank", color: "#004B93", textColor: "#ffffff" },
];

const doorAnimations = [
    { id: "double-door", name: "Double Door", description: "Classic double doors opening from center" },
    { id: "single-door", name: "Single Door", description: "Single door swings open from left" },
    { id: "curtain-reveal", name: "Curtain Reveal", description: "Elegant curtains parting to reveal" },
    { id: "envelope-open", name: "Envelope Open", description: "Invitation envelope opens up" },
    { id: "scroll-unroll", name: "Scroll Unroll", description: "Scroll unfurls from top to bottom" },
    { id: "gate-swing", name: "Gate Swing", description: "Ornate gates swing outward" },
    { id: "book-flip", name: "Book Flip", description: "Book cover flips open" },
    { id: "slide-up", name: "Slide Up", description: "Card slides up to reveal content" },
];

const eWallets = [
    { name: "Touch 'n Go eWallet", color: "#005ABB", textColor: "#ffffff" },
    { name: "GrabPay", color: "#00B14F", textColor: "#ffffff" },
    { name: "Boost", color: "#E31837", textColor: "#ffffff" },
    { name: "ShopeePay", color: "#EE4D2D", textColor: "#ffffff" },
    { name: "MAE by Maybank", color: "#FFC72C", textColor: "#000000" },
];

// ============= INITIAL STATE =============
const initialEventData: EventData = {
    selectedTemplate: null,
    templateCategory: "All",
    colorPalette: "gold-elegant",
    fontStyle: "classic",
    backgroundStyle: "gradient",
    doorAnimation: "double-door",
    musicEnabled: true,
    selectedMusic: null,
    autoMute: true,
    enabledSections: {
        location: true,
        itinerary: true,
        contact: true,
        gift: true,
        gallery: false,
        video: false,
        countdown: true,
        wishes: false,
    },
    contacts: [{ id: "1", name: "", phone: "", countryCode: "+60", role: "", showWhatsApp: true }],
    itinerary: [{ id: "1", time: "12:00", activity: "", location: "" }],
    giftType: "bank",
    bankDetails: { bankName: "", accountNumber: "", accountHolder: "" },
    ewalletDetails: { provider: "", phoneNumber: "", accountName: "" },
    physicalGift: { address: "", notes: "" },
    // Event Details
    eventName: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    address: "",
    hostName: "",
    coupleName1: "",
    coupleName2: "",
    celebrantName: "",
    companyName: "",
    parentsBride: "",
    parentsGroom: "",
    description: "",
    eventType: "",
    bridePhoto: null,
    groomPhoto: null,
    celebrantPhoto: null,
    babyPhoto: null,
    logoPhoto: null,
    hostPhoto: null,
};

// ============= SECTION COMPONENTS =============
function TemplateSection({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
    const filteredTemplates = data.templateCategory === "All"
        ? templates
        : templates.filter(t => t.category === data.templateCategory || t.category === "All");

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
                {templateCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onChange({ templateCategory: cat })}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${data.templateCategory === cat
                            ? "bg-primary text-white"
                            : "bg-background-tertiary text-foreground-muted hover:text-white"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onChange({ selectedTemplate: template.id })}
                        className={`glass-card overflow-hidden cursor-pointer transition-all group ${data.selectedTemplate === template.id
                            ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                            : "hover:border-white/20"
                            }`}
                    >
                        <div className="aspect-[3/4] relative overflow-hidden">
                            <img
                                src={`/templates/${template.id}.png`}
                                alt={template.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {data.selectedTemplate === template.id && (
                                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                                <span className={`badge-${template.tier} text-[10px] font-bold px-2 py-0.5 rounded-full text-white`}>
                                    {template.tier.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-foreground-muted">{template.category}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ThemeSection({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Palette
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {colorPalettes.map((palette) => (
                        <button
                            key={palette.id}
                            onClick={() => onChange({ colorPalette: palette.id })}
                            className={`p-4 rounded-xl transition-all ${data.colorPalette === palette.id
                                ? "ring-2 ring-primary bg-primary/10"
                                : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                }`}
                        >
                            <div className="flex gap-1 mb-3">
                                {palette.colors.map((color, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                                ))}
                            </div>
                            <p className="text-sm text-white font-medium">{palette.name}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-primary" />
                    Font Style
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {fontStyles.map((font) => (
                        <button
                            key={font.id}
                            onClick={() => onChange({ fontStyle: font.id })}
                            className={`p-4 rounded-xl text-center transition-all ${data.fontStyle === font.id
                                ? "ring-2 ring-primary bg-primary/10"
                                : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                }`}
                        >
                            <p className="text-xl text-white mb-2" style={{ fontFamily: font.family }}>Aa Bb</p>
                            <p className="text-sm text-foreground-muted">{font.name}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-primary" />
                    Background Style
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {backgrounds.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => onChange({ backgroundStyle: bg.id })}
                            className={`p-4 rounded-xl text-center transition-all ${data.backgroundStyle === bg.id
                                ? "ring-2 ring-primary bg-primary/10"
                                : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                <Square className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-sm text-white font-medium">{bg.name}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Square className="w-5 h-5 text-primary" />
                    Opening Animation
                </h3>
                <p className="text-sm text-foreground-muted mb-4">Choose how your invitation opens when guests view it</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {doorAnimations.map((anim) => (
                        <button
                            key={anim.id}
                            onClick={() => onChange({ doorAnimation: anim.id })}
                            className={`p-4 rounded-xl text-center transition-all ${data.doorAnimation === anim.id
                                ? "ring-2 ring-primary bg-primary/10"
                                : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2 relative overflow-hidden">
                                {anim.id === "double-door" && (
                                    <>
                                        <div className="absolute left-0 w-1/2 h-full bg-primary/40" />
                                        <div className="absolute right-0 w-1/2 h-full bg-primary/40" />
                                    </>
                                )}
                                {anim.id === "single-door" && <div className="absolute left-0 w-3/4 h-full bg-primary/40" />}
                                {anim.id === "curtain-reveal" && (
                                    <>
                                        <div className="absolute left-0 w-1/2 h-full bg-secondary/40 rounded-r-full" />
                                        <div className="absolute right-0 w-1/2 h-full bg-secondary/40 rounded-l-full" />
                                    </>
                                )}
                                {anim.id === "envelope-open" && <Mail className="w-6 h-6 text-primary" />}
                                {anim.id === "scroll-unroll" && <div className="w-8 h-10 bg-primary/40 rounded-sm" />}
                                {anim.id === "gate-swing" && <Sparkles className="w-6 h-6 text-primary" />}
                                {anim.id === "book-flip" && <div className="w-8 h-10 bg-primary/40 rounded-r-lg border-l-4 border-primary" />}
                                {anim.id === "slide-up" && <ChevronUp className="w-6 h-6 text-primary" />}
                            </div>
                            <p className="text-sm text-white font-medium">{anim.name}</p>
                            <p className="text-xs text-foreground-muted mt-1">{anim.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MusicSection({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
    const [isPlaying, setIsPlaying] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Enable Background Music</h3>
                        <p className="text-sm text-foreground-muted">Music will play when guests open your invitation</p>
                    </div>
                    <button
                        onClick={() => onChange({ musicEnabled: !data.musicEnabled })}
                        className={`w-14 h-8 rounded-full transition-all ${data.musicEnabled ? "bg-primary" : "bg-background-tertiary"}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform mx-1 ${data.musicEnabled ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                </div>
            </div>
            {data.musicEnabled && (
                <div className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-[var(--glass-border)]">
                        <h3 className="font-semibold text-white">Music Library</h3>
                    </div>
                    <div className="divide-y divide-[var(--glass-border)]">
                        {musicLibrary.map((track) => (
                            <div
                                key={track.id}
                                onClick={() => onChange({ selectedMusic: track.id })}
                                className={`p-4 flex items-center justify-between cursor-pointer transition-all ${data.selectedMusic === track.id ? "bg-primary/10" : "hover:bg-[var(--glass-bg)]"}`}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsPlaying(isPlaying === track.id ? null : track.id); }}
                                        className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                                    >
                                        {isPlaying === track.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                    </button>
                                    <div>
                                        <p className="text-white font-medium">{track.name}</p>
                                        <p className="text-xs text-foreground-muted">{track.category} • {track.duration}</p>
                                    </div>
                                </div>
                                {data.selectedMusic === track.id && (
                                    <span className="text-primary text-sm font-medium flex items-center gap-1">
                                        <Check className="w-4 h-4" /> Selected
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SectionsSection({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
    const toggleSection = (sectionId: string) => {
        const section = sectionOptions.find(s => s.id === sectionId);
        if (section?.required || section?.premium) return;
        onChange({ enabledSections: { ...data.enabledSections, [sectionId]: !data.enabledSections[sectionId] } });
    };

    return (
        <div className="space-y-4">
            {sectionOptions.map((section) => {
                const SectionIcon = sectionIcons[section.id] || MapPin;
                return (
                    <div
                        key={section.id}
                        className={`glass-card p-5 flex items-center justify-between transition-all ${data.enabledSections[section.id] ? "border-primary/30" : ""} ${section.premium ? "opacity-60" : ""}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <SectionIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white">{section.name}</h3>
                                    {section.required && <span className="text-xs bg-info/20 text-info px-2 py-0.5 rounded-full">Required</span>}
                                    {section.premium && <span className="text-xs bg-premium/20 text-premium px-2 py-0.5 rounded-full">Premium+</span>}
                                </div>
                                <p className="text-sm text-foreground-muted">{section.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleSection(section.id)}
                            disabled={section.required || section.premium}
                            className={`w-14 h-8 rounded-full transition-all ${data.enabledSections[section.id] ? "bg-primary" : "bg-background-tertiary"} ${section.required || section.premium ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform mx-1 ${data.enabledSections[section.id] ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function ContactSection({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
    const addContact = () => {
        const newContact: Contact = { id: Date.now().toString(), name: "", phone: "", countryCode: "+60", role: "", showWhatsApp: true };
        onChange({ contacts: [...data.contacts, newContact] });
    };

    const removeContact = (id: string) => {
        if (data.contacts.length > 1) {
            onChange({ contacts: data.contacts.filter(c => c.id !== id) });
        }
    };

    const updateContact = (id: string, field: string, value: string | boolean) => {
        onChange({ contacts: data.contacts.map(c => c.id === id ? { ...c, [field]: value } : c) });
    };

    return (
        <div className="space-y-4">
            {data.contacts.map((contact, index) => (
                <div key={contact.id} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-primary" />
                            Contact {index + 1}
                        </h3>
                        {data.contacts.length > 1 && (
                            <button onClick={() => removeContact(contact.id)} className="text-error hover:bg-error/10 p-2 rounded-lg">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-5">
                        <div>
                            <label className="text-base text-foreground-muted block mb-2">Name *</label>
                            <input
                                type="text"
                                value={contact.name}
                                onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                                placeholder="Contact person name"
                                className="input-field h-14 text-base"
                            />
                        </div>
                        <div>
                            <label className="text-base text-foreground-muted block mb-2">Phone Number *</label>
                            <div className="flex gap-3">
                                <select
                                    value={contact.countryCode}
                                    onChange={(e) => updateContact(contact.id, "countryCode", e.target.value)}
                                    className="input-field h-14 text-base shrink-0"
                                    style={{ width: '96px' }}
                                >
                                    <option value="+60">+60</option>
                                    <option value="+65">+65</option>
                                    <option value="+62">+62</option>
                                </select>
                                <input
                                    type="tel"
                                    value={contact.phone}
                                    onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                                    placeholder="12-345 6789"
                                    className="input-field h-14 text-base flex-1 min-w-0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-base text-foreground-muted block mb-2">Role (Optional)</label>
                            <input
                                type="text"
                                value={contact.role}
                                onChange={(e) => updateContact(contact.id, "role", e.target.value)}
                                placeholder="e.g., Bride, Groom, Event Planner"
                                className="input-field h-14 text-base"
                            />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addContact} className="btn-secondary w-full py-4 flex items-center justify-center gap-2 text-base font-medium">
                <Plus className="w-5 h-5" /> Add Another Contact
            </button>
        </div>
    );
}

function ItinerarySection({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
    const addItem = () => {
        const newItem: ItineraryItem = { id: Date.now().toString(), time: "", activity: "", location: "" };
        onChange({ itinerary: [...data.itinerary, newItem] });
    };

    const removeItem = (id: string) => {
        if (data.itinerary.length > 1) {
            onChange({ itinerary: data.itinerary.filter(i => i.id !== id) });
        }
    };

    const updateItem = (id: string, field: string, value: string) => {
        onChange({ itinerary: data.itinerary.map(i => i.id === id ? { ...i, [field]: value } : i) });
    };

    return (
        <div className="space-y-4">
            {data.itinerary.map((item, index) => (
                <div key={item.id} className="glass-card p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {index + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-foreground-muted block mb-1">Time</label>
                                <TimePicker value={item.time} onChange={(v) => updateItem(item.id, "time", v)} />
                            </div>
                            <div>
                                <label className="text-xs text-foreground-muted block mb-1">Activity</label>
                                <input
                                    type="text"
                                    value={item.activity}
                                    onChange={(e) => updateItem(item.id, "activity", e.target.value)}
                                    placeholder="e.g., Reception"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-foreground-muted block mb-1">Location</label>
                                <input
                                    type="text"
                                    value={item.location}
                                    onChange={(e) => updateItem(item.id, "location", e.target.value)}
                                    placeholder="e.g., Main Hall"
                                    className="input-field"
                                />
                            </div>
                        </div>
                        {data.itinerary.length > 1 && (
                            <button onClick={() => removeItem(item.id)} className="text-error hover:bg-error/10 p-2 rounded-lg shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
            <button onClick={addItem} className="btn-secondary w-full flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Schedule Item
            </button>
        </div>
    );
}

function GiftSection({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
    const giftTypes = [
        { id: "bank", name: "Bank Transfer", Icon: Landmark },
        { id: "ewallet", name: "E-Wallet", Icon: Smartphone },
        { id: "physical", name: "Physical Gift", Icon: Package },
    ];

    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">How would you like to receive gifts?</h3>
                <div className="grid grid-cols-3 gap-3">
                    {giftTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => onChange({ giftType: type.id })}
                            className={`p-4 rounded-xl text-center transition-all ${data.giftType === type.id
                                ? "ring-2 ring-primary bg-primary/10"
                                : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                <type.Icon className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-sm text-white font-medium">{type.name}</p>
                        </button>
                    ))}
                </div>
            </div>
            {data.giftType === "bank" && (
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-primary" /> Bank Details
                    </h3>
                    <div>
                        <label className="text-sm text-foreground-muted block mb-2">Bank Name *</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {malaysianBanks.map(bank => (
                                <button
                                    key={bank.name}
                                    type="button"
                                    onClick={() => onChange({ bankDetails: { ...data.bankDetails, bankName: bank.name } })}
                                    className={`p-3 rounded-xl flex items-center gap-3 transition-all ${data.bankDetails.bankName === bank.name
                                        ? "ring-2 ring-primary bg-primary/10"
                                        : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{ backgroundColor: bank.color, color: bank.textColor }}
                                    >
                                        {bank.name.charAt(0)}
                                    </div>
                                    <span className="text-white text-sm font-medium text-left">{bank.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-foreground-muted block mb-1">Account Number *</label>
                        <input
                            type="text"
                            value={data.bankDetails.accountNumber}
                            onChange={(e) => onChange({ bankDetails: { ...data.bankDetails, accountNumber: e.target.value } })}
                            placeholder="e.g., 1234 5678 9012"
                            className="input-field h-14 text-base"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-foreground-muted block mb-1">Account Holder *</label>
                        <input
                            type="text"
                            value={data.bankDetails.accountHolder}
                            onChange={(e) => onChange({ bankDetails: { ...data.bankDetails, accountHolder: e.target.value } })}
                            placeholder="Name as shown on bank account"
                            className="input-field h-14 text-base"
                        />
                    </div>
                </div>
            )}
            {data.giftType === "ewallet" && (
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-primary" /> E-Wallet Details
                    </h3>
                    <div>
                        <label className="text-sm text-foreground-muted block mb-2">Provider *</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {eWallets.map(wallet => (
                                <button
                                    key={wallet.name}
                                    type="button"
                                    onClick={() => onChange({ ewalletDetails: { ...data.ewalletDetails, provider: wallet.name } })}
                                    className={`p-3 rounded-xl flex items-center gap-3 transition-all ${data.ewalletDetails.provider === wallet.name
                                        ? "ring-2 ring-primary bg-primary/10"
                                        : "bg-background-tertiary hover:bg-[var(--glass-bg)]"
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{ backgroundColor: wallet.color, color: wallet.textColor }}
                                    >
                                        {wallet.name.charAt(0)}
                                    </div>
                                    <span className="text-white text-sm font-medium text-left">{wallet.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-foreground-muted block mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            value={data.ewalletDetails.phoneNumber}
                            onChange={(e) => onChange({ ewalletDetails: { ...data.ewalletDetails, phoneNumber: e.target.value } })}
                            placeholder="012-345 6789"
                            className="input-field h-14 text-base"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-foreground-muted block mb-1">Account Name *</label>
                        <input
                            type="text"
                            value={data.ewalletDetails.accountName}
                            onChange={(e) => onChange({ ewalletDetails: { ...data.ewalletDetails, accountName: e.target.value } })}
                            placeholder="Name on e-wallet"
                            className="input-field h-14 text-base"
                        />
                    </div>
                </div>
            )}
            {data.giftType === "physical" && (
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" /> Physical Gift Details
                    </h3>
                    <div>
                        <label className="text-sm text-foreground-muted block mb-1">Delivery Address *</label>
                        <textarea
                            value={data.physicalGift.address}
                            onChange={(e) => onChange({ physicalGift: { ...data.physicalGift, address: e.target.value } })}
                            placeholder="Full address including postcode"
                            rows={3}
                            className="input-field resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-foreground-muted block mb-1">Notes</label>
                        <input
                            type="text"
                            value={data.physicalGift.notes}
                            onChange={(e) => onChange({ physicalGift: { ...data.physicalGift, notes: e.target.value } })}
                            placeholder="e.g., Cash only, No flowers"
                            className="input-field"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function PreviewSection({ data }: { data: EventData }) {
    const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
    const [isOpen, setIsOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Get selected template info
    const selectedTemplate = templates.find(t => t.id === data.selectedTemplate);
    const selectedPalette = colorPalettes.find(p => p.id === data.colorPalette);
    const selectedFont = fontStyles.find(f => f.id === data.fontStyle);
    const selectedMusic = musicLibrary.find(m => m.id === data.selectedMusic);
    const selectedAnimation = doorAnimations.find(a => a.id === data.doorAnimation);

    // Get colors from palette
    const primaryColor = selectedPalette?.colors[0] || "#6366f1";
    const bgColor = selectedPalette?.colors[1] || "#1a1a24";
    const accentColor = selectedPalette?.colors[2] || primaryColor;

    // Event type detection
    const eventType = data.eventType?.toLowerCase() || "";
    const isWedding = eventType.includes("wedding") || eventType.includes("nikah") || eventType.includes("engagement");
    const isBirthday = eventType.includes("birthday") || eventType.includes("surprise");
    const isBabyEvent = eventType.includes("baby") || eventType.includes("aqiqah");
    const isFamilyEvent = eventType.includes("family") || eventType.includes("reunion") || eventType.includes("housewarming") || eventType.includes("kenduri") || eventType.includes("religious");

    // Date formatter
    const formatEventDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-MY', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Floating dock items
    const dockItems = [
        { id: "music", icon: Music, label: "Music", show: data.musicEnabled },
        { id: "contact", icon: Phone, label: "Contact", show: data.enabledSections.contact },
        { id: "gift", icon: Gift, label: "Gift", show: data.enabledSections.gift },
        { id: "rsvp", icon: Calendar, label: "RSVP", show: true },
        { id: "map", icon: MapPin, label: "Map", show: data.enabledSections.location },
    ].filter(item => item.show);

    // Door animation styles
    const getDoorStyle = () => {
        // Added z-50 to Ensure door is clickable above other elements when closed
        const base = "absolute inset-0 flex items-center justify-center transition-all duration-1000 cursor-pointer perspective-1000 preserve-3d z-50";
        if (isOpen) return `${base} pointer-events-none`;
        return base;
    };

    const renderDoorAnimation = () => {
        const animId = data.doorAnimation || "double-door";

        switch (animId) {
            case "double-door":
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div className={`absolute left-0 w-1/2 h-full transition-transform duration-1000 ${isOpen ? "-translate-x-full" : ""}`}
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                            <div className="h-full flex items-center justify-end pr-2">
                                <div className="w-3 h-20 rounded-full bg-white/30" />
                            </div>
                        </div>
                        <div className={`absolute right-0 w-1/2 h-full transition-transform duration-1000 ${isOpen ? "translate-x-full" : ""}`}
                            style={{ background: `linear-gradient(225deg, ${primaryColor}, ${accentColor})` }}>
                            <div className="h-full flex items-center justify-start pl-2">
                                <div className="w-3 h-20 rounded-full bg-white/30" />
                            </div>
                        </div>
                        {!isOpen && (
                            <div className="absolute z-10 text-center text-white">
                                <p className="text-sm uppercase tracking-widest mb-2">Tap to Open</p>
                                <ChevronUp className="w-6 h-6 mx-auto animate-bounce" />
                            </div>
                        )}
                    </div>
                );

            case "single-door":
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div
                            className={`absolute inset-0 origin-left transition-all duration-1000 preserve-3d ${isOpen ? "-rotate-y-90 opacity-0" : ""}`}
                            style={{ background: `linear-gradient(90deg, ${accentColor}, ${primaryColor})` }}>
                            <div className="h-full flex items-center justify-end pr-4">
                                <div className="w-3 h-24 rounded-full bg-white/30" />
                            </div>
                            {!isOpen && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-center">
                                    <div>
                                        <p className="text-sm uppercase tracking-widest mb-2">Tap to Open</p>
                                        <ArrowRight className="w-6 h-6 mx-auto animate-pulse" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "curtain-reveal":
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div className={`absolute left-0 w-1/2 h-full transition-transform duration-1000 origin-left ${isOpen ? "scale-x-0" : ""}`}
                            style={{ background: `linear-gradient(90deg, ${accentColor}, ${primaryColor})` }} />
                        <div className={`absolute right-0 w-1/2 h-full transition-transform duration-1000 origin-right ${isOpen ? "scale-x-0" : ""}`}
                            style={{ background: `linear-gradient(270deg, ${accentColor}, ${primaryColor})` }} />
                        {!isOpen && (
                            <div className="absolute z-10 text-center text-white">
                                <p className="text-sm uppercase tracking-widest mb-2">Tap to Reveal</p>
                                <Sparkles className="w-6 h-6 mx-auto animate-pulse" />
                            </div>
                        )}
                    </div>
                );

            case "envelope-open":
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div
                            className={`absolute inset-0 transition-all duration-1000 ${isOpen ? "opacity-0 scale-90 -translate-y-12" : ""}`}
                            style={{ background: primaryColor }}>
                            <div className="absolute top-0 left-0 right-0 h-[40%]"
                                style={{
                                    background: accentColor,
                                    clipPath: "polygon(0 0, 50% 100%, 100% 0)"
                                }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 h-[35%]" style={{
                                background: accentColor,
                                clipPath: "polygon(0 100%, 50% 20%, 100% 100%)"
                            }} />
                            {!isOpen && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-center">
                                    <div>
                                        <Mail className="w-10 h-10 mx-auto mb-2" />
                                        <p className="text-sm uppercase tracking-widest">Tap to Open</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "scroll-unroll":
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div
                            className={`absolute inset-0 origin-top transition-all duration-1000 ${isOpen ? "scale-y-0 -translate-y-full opacity-0" : ""}`}
                            style={{ background: `linear-gradient(180deg, ${primaryColor} 0%, ${accentColor} 50%, ${primaryColor} 100%)` }}>
                            <div className="absolute top-0 left-0 right-0 h-8 rounded-b-full shadow-lg"
                                style={{ background: accentColor }} />
                            <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-full shadow-lg"
                                style={{ background: accentColor }} />
                            {!isOpen && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-center">
                                    <div>
                                        <ChevronUp className="w-10 h-10 mx-auto mb-2 animate-bounce" />
                                        <p className="text-sm uppercase tracking-widest">Tap to Unroll</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "gate-swing":
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div
                            className={`absolute left-0 w-1/2 h-full origin-left transition-all duration-1000 preserve-3d ${isOpen ? "-rotate-y-120 opacity-0" : ""}`}
                            style={{ background: `linear-gradient(90deg, ${accentColor}, ${primaryColor})` }}>
                            <div className="h-full flex items-center justify-around px-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-2 h-4/5 rounded-full bg-white/20" />)}
                            </div>
                        </div>
                        <div
                            className={`absolute right-0 w-1/2 h-full origin-right transition-all duration-1000 preserve-3d ${isOpen ? "rotate-y-120 opacity-0" : ""}`}
                            style={{ background: `linear-gradient(270deg, ${accentColor}, ${primaryColor})` }}>
                            <div className="h-full flex items-center justify-around px-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-2 h-4/5 rounded-full bg-white/20" />)}
                            </div>
                        </div>
                        {!isOpen && (
                            <div className="absolute z-10 text-center text-white">
                                <p className="text-sm uppercase tracking-widest mb-2">Tap to Enter</p>
                                <Sparkles className="w-6 h-6 mx-auto animate-pulse" />
                            </div>
                        )}
                    </div>
                );

            case "book-flip":
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div
                            className={`absolute inset-0 origin-left transition-all duration-1000 preserve-3d ${isOpen ? "-rotate-y-180 opacity-0" : ""}`}
                            style={{ background: primaryColor }}>
                            <div className="absolute left-0 top-0 bottom-0 w-4"
                                style={{ background: accentColor }} />
                            <div className="h-full flex items-center justify-center pl-4">
                                <div className="text-center text-white">
                                    <div className="w-20 h-28 border-2 border-white/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-white/50" />
                                    </div>
                                    <p className="text-sm uppercase tracking-widest">Tap to Open</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "slide-up":
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div
                            className={`absolute inset-0 transition-all duration-1000 ${isOpen ? "-translate-y-full" : ""}`}
                            style={{ background: `linear-gradient(180deg, ${primaryColor}, ${accentColor})` }}>
                            {!isOpen && (
                                <div className="h-full flex items-center justify-center text-white text-center">
                                    <div>
                                        <ChevronUp className="w-10 h-10 mx-auto mb-2 animate-bounce" />
                                        <p className="text-sm uppercase tracking-widest">Swipe Up to Open</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={getDoorStyle()} onClick={() => setIsOpen(true)}>
                        <div className={`absolute left-0 w-1/2 h-full transition-transform duration-1000 ${isOpen ? "-translate-x-full" : ""}`}
                            style={{ background: primaryColor }} />
                        <div className={`absolute right-0 w-1/2 h-full transition-transform duration-1000 ${isOpen ? "translate-x-full" : ""}`}
                            style={{ background: primaryColor }} />
                        {!isOpen && (
                            <div className="absolute z-10 text-center text-white">
                                <p className="text-sm uppercase tracking-widest">Tap to Open</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-center gap-4 flex-wrap">
                <div className="glass-card p-1 inline-flex">
                    <button
                        onClick={() => setViewMode("mobile")}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${viewMode === "mobile" ? "bg-primary text-white" : "text-foreground-muted hover:text-white"}`}
                    >
                        <Smartphone className="w-4 h-4" /> Mobile
                    </button>
                    <button
                        onClick={() => setViewMode("desktop")}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${viewMode === "desktop" ? "bg-primary text-white" : "text-foreground-muted hover:text-white"}`}
                    >
                        <Laptop className="w-4 h-4" /> Desktop
                    </button>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="glass-card px-4 py-2 text-sm text-foreground-muted hover:text-white transition-colors"
                >
                    Reset Door
                </button>
            </div>

            {/* Preview Summary */}
            <div className="glass-card p-4">
                <h4 className="text-white font-semibold mb-3">Your Selections</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                        <p className="text-foreground-muted">Template</p>
                        <p className="text-white font-medium">{selectedTemplate?.name || "Not selected"}</p>
                    </div>
                    <div>
                        <p className="text-foreground-muted">Color Theme</p>
                        <p className="text-white font-medium">{selectedPalette?.name || "Not selected"}</p>
                    </div>
                    <div>
                        <p className="text-foreground-muted">Font</p>
                        <p className="text-white font-medium">{selectedFont?.name || "Not selected"}</p>
                    </div>
                    <div>
                        <p className="text-foreground-muted">Opening</p>
                        <p className="text-white font-medium">{selectedAnimation?.name || "Double Door"}</p>
                    </div>
                    <div>
                        <p className="text-foreground-muted">Music</p>
                        <p className="text-white font-medium">{data.musicEnabled ? (selectedMusic?.name || "None") : "Off"}</p>
                    </div>
                </div>
            </div>

            {/* Phone/Desktop Preview */}
            <div className="flex justify-center">
                <div
                    className={`rounded-[40px] shadow-2xl border-4 border-[var(--glass-border)] overflow-hidden transition-all duration-500 relative ${viewMode === "mobile" ? "w-[320px] h-[640px]" : "w-full max-w-4xl h-[600px]"}`}
                    style={{ backgroundColor: bgColor }}
                >
                    {/* Door Animation Overlay */}
                    {renderDoorAnimation()}

                    {/* Main Content (visible when door opens) */}
                    <div className={`h-full overflow-y-auto pb-20 transition-opacity duration-500 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                        {/* Section 1: Hero - Names & Date */}
                        <div className="p-6 flex flex-col items-center justify-center text-center min-h-[280px]" style={{ fontFamily: selectedFont?.family }}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: `${primaryColor}20` }}>
                                <Sparkles className="w-7 h-7" style={{ color: primaryColor }} />
                            </div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">You are cordially invited</p>

                            {/* Event Name / Couple Names */}
                            {isWedding && (data.coupleName1 || data.coupleName2) ? (
                                <>
                                    <h1 className="text-xl font-bold text-white mb-1">
                                        {data.coupleName1 || "Bride"} <span style={{ color: primaryColor }}>&</span> {data.coupleName2 || "Groom"}
                                    </h1>
                                    <p className="text-gray-400 text-sm mb-2">{data.eventName || "Wedding Ceremony"}</p>
                                </>
                            ) : isBirthday && data.celebrantName ? (
                                <>
                                    <h1 className="text-xl font-bold text-white mb-1">{data.celebrantName}</h1>
                                    <p className="text-gray-400 text-sm mb-2">{data.eventName || "Birthday Celebration"}</p>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-xl font-bold text-white mb-1">{data.eventName || selectedTemplate?.name || "Your Event"}</h1>
                                    <p className="text-gray-400 text-sm mb-2">{data.eventType || selectedTemplate?.category || "Event"}</p>
                                </>
                            )}

                            {/* Date Display */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 w-full mb-3">
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Save the Date</p>
                                <p className="text-lg font-bold" style={{ color: primaryColor }}>
                                    {data.eventDate ? formatEventDate(data.eventDate) : "Coming Soon"}
                                </p>
                                {data.eventTime && (
                                    <p className="text-sm text-gray-300 mt-1">{data.eventTime}</p>
                                )}
                            </div>

                            {/* Couple/Celebrant Photos */}
                            {isWedding && (data.bridePhoto || data.groomPhoto) && (
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    {data.bridePhoto && (
                                        <img src={data.bridePhoto} alt="Bride" className="w-16 h-16 rounded-full object-cover border-2 border-pink-400" />
                                    )}
                                    {data.bridePhoto && data.groomPhoto && (
                                        <div className="text-pink-400 text-2xl">&hearts;</div>
                                    )}
                                    {data.groomPhoto && (
                                        <img src={data.groomPhoto} alt="Groom" className="w-16 h-16 rounded-full object-cover border-2 border-blue-400" />
                                    )}
                                </div>
                            )}
                            {isBirthday && data.celebrantPhoto && (
                                <img src={data.celebrantPhoto} alt="Celebrant" className="w-20 h-20 rounded-full object-cover border-2 mt-2" style={{ borderColor: primaryColor }} />
                            )}
                        </div>

                        {/* Section 2: Family / Parents */}
                        {(isWedding && (data.parentsBride || data.parentsGroom)) && (
                            <div className="px-4 pb-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide text-center mb-3">With the blessings of</p>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        {data.parentsBride && (
                                            <div>
                                                <p className="text-white font-medium text-sm">{data.parentsBride}</p>
                                                <p className="text-xs text-gray-500">Parents of the Bride</p>
                                            </div>
                                        )}
                                        {data.parentsGroom && (
                                            <div>
                                                <p className="text-white font-medium text-sm">{data.parentsGroom}</p>
                                                <p className="text-xs text-gray-500">Parents of the Groom</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {(isBirthday || isFamilyEvent) && data.hostName && (
                            <div className="px-4 pb-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Hosted by</p>
                                    <p className="text-white font-medium">{data.hostName}</p>
                                </div>
                            </div>
                        )}

                        {/* Section 3: Location & Schedule */}
                        {data.enabledSections.location && (data.venue || data.address) && (
                            <div className="px-4 pb-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                                        <p className="text-white font-medium text-sm">Location</p>
                                    </div>
                                    {data.venue && (
                                        <p className="text-white font-semibold mb-1">{data.venue}</p>
                                    )}
                                    {data.address && (
                                        <p className="text-gray-400 text-xs mb-3">{data.address}</p>
                                    )}
                                    {/* Map Placeholder */}
                                    <div className="bg-gray-800 rounded-lg h-32 flex items-center justify-center text-gray-500 text-xs mb-3">
                                        <MapPin className="w-6 h-6 mr-2" /> Google Maps Preview
                                    </div>
                                    {/* Navigation Buttons */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 rounded-lg bg-white/10 text-white text-xs flex items-center justify-center gap-1">
                                            <Navigation className="w-3 h-3" /> Google Maps
                                        </button>
                                        <button className="flex-1 py-2 rounded-lg bg-white/10 text-white text-xs flex items-center justify-center gap-1">
                                            <Navigation className="w-3 h-3" /> Waze
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Countdown */}
                        {data.enabledSections.countdown && (
                            <div className="px-4 pb-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                    <div className="flex justify-center gap-3">
                                        {["Days", "Hrs", "Min", "Sec"].map((label) => (
                                            <div key={label} className="text-center">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: `${primaryColor}20` }}>
                                                    --
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 4: Itinerary */}
                        {data.enabledSections.itinerary && data.itinerary.length > 0 && data.itinerary.some(i => i.activity) && (
                            <div className="px-4 pb-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
                                        <p className="text-white font-medium text-sm">Itinerary</p>
                                    </div>
                                    <div className="space-y-2">
                                        {data.itinerary.filter(i => i.activity).map((item, idx) => (
                                            <div key={idx} className="flex gap-3 text-xs">
                                                <span className="text-gray-400 w-12 shrink-0">{item.time}</span>
                                                <span className="text-white">{item.activity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RSVP Preview */}
                        <div className="px-4 pb-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Check className="w-4 h-4" style={{ color: primaryColor }} />
                                    <p className="text-white font-medium text-sm">RSVP</p>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        placeholder="Guest Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-xs"
                                    />
                                    <input
                                        placeholder="Phone Number"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-xs"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 mb-1 block">Time to Attend</label>
                                            <input
                                                type="text"
                                                placeholder="Select Time"
                                                defaultValue="12:00 PM"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 mb-1 block">Total Pax</label>
                                            <input
                                                type="number"
                                                placeholder="1"
                                                defaultValue="2"
                                                min="1"
                                                max="20"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button className="flex-1 py-2 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: primaryColor }}>
                                        Attending
                                    </button>
                                    <button className="flex-1 py-2 rounded-lg bg-white/10 text-white text-xs font-medium">
                                        Unable
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Prayers / Blessings Section */}
                        <div className="px-4 pb-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                    {isWedding ? "Doa Pengantin" : isBirthday ? "Ucapan & Harapan" : isBabyEvent ? "Doa untuk Bayi" : "Prayers & Blessings"}
                                </p>
                                <p className="text-white/80 text-xs italic leading-relaxed">
                                    {isWedding
                                        ? "\"Ya Allah, berkahilah pasangan ini dengan cinta yang abadi, keharmonian dalam rumah tangga, dan zuriat yang soleh.\""
                                        : isBirthday
                                            ? "\"Semoga dipanjangkan umur, dimurahkan rezeki, dan sentiasa dalam lindungan rahmat Allah.\""
                                            : isBabyEvent
                                                ? "\"Ya Allah, jadikanlah anak ini soleh/solehah, sihat, dan berguna kepada agama, bangsa dan negara.\""
                                                : "\"May this celebration bring joy, blessings, and cherished memories for all.\""}
                                </p>
                            </div>
                        </div>

                        {/* Wishes */}
                        {data.enabledSections.wishes && (
                            <div className="px-4 pb-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4" style={{ color: primaryColor }} />
                                        <p className="text-white font-medium text-sm">Wishes</p>
                                    </div>
                                    <p className="text-xs text-gray-400">Leave your wishes...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Floating Dock */}
                    {isOpen && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                            <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-2 py-2 flex gap-1 shadow-xl border border-white/10">
                                {dockItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveModal(item.id)}
                                        className="flex flex-col items-center px-3 py-1 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <item.icon className="w-5 h-5 mb-0.5" style={{ color: primaryColor }} />
                                        <span className="text-[10px] text-gray-400">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Modal Overlays */}
                    {activeModal && (
                        <div className="absolute inset-0 z-30 bg-black/80 flex items-end" onClick={() => setActiveModal(null)}>
                            <div className="bg-[#1a1a24] rounded-t-3xl w-full max-h-[70%] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                                <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />

                                {activeModal === "music" && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Music className="w-5 h-5" style={{ color: primaryColor }} /> Background Music
                                        </h3>
                                        <p className="text-gray-400">{selectedMusic?.name || "No music selected"}</p>
                                        <button className="mt-4 w-full py-3 rounded-xl bg-white/10 text-white flex items-center justify-center gap-2">
                                            <Play className="w-4 h-4" /> Play Music
                                        </button>
                                    </div>
                                )}

                                {activeModal === "contact" && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Phone className="w-5 h-5" style={{ color: primaryColor }} /> Contact
                                        </h3>
                                        {data.contacts.map((c, i) => (
                                            <div key={i} className="flex items-center justify-between py-3 border-b border-white/10">
                                                <div>
                                                    <p className="text-white font-medium">{c.name || "Contact"}</p>
                                                    <p className="text-sm text-gray-400">{c.role}</p>
                                                </div>
                                                <a href={`tel:${c.countryCode}${c.phone}`} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">
                                                    {c.countryCode}{c.phone}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeModal === "gift" && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Gift className="w-5 h-5" style={{ color: primaryColor }} /> Gift / Angpao
                                        </h3>
                                        {data.giftType === "bank" && data.bankDetails.bankName && (
                                            <div className="bg-white/5 rounded-xl p-4">
                                                <p className="text-gray-400 text-sm">Bank Transfer</p>
                                                <p className="text-white font-bold">{data.bankDetails.bankName}</p>
                                                <p className="text-white">{data.bankDetails.accountNumber}</p>
                                                <p className="text-gray-400">{data.bankDetails.accountHolder}</p>
                                            </div>
                                        )}
                                        {data.giftType === "ewallet" && data.ewalletDetails.provider && (
                                            <div className="bg-white/5 rounded-xl p-4">
                                                <p className="text-gray-400 text-sm">E-Wallet</p>
                                                <p className="text-white font-bold">{data.ewalletDetails.provider}</p>
                                                <p className="text-white">{data.ewalletDetails.phoneNumber}</p>
                                                <p className="text-gray-400">{data.ewalletDetails.accountName}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeModal === "rsvp" && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5" style={{ color: primaryColor }} /> RSVP
                                        </h3>
                                        <div className="space-y-4">
                                            <input placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500" />
                                            <div className="flex gap-3">
                                                <button className="flex-1 py-3 rounded-xl text-white font-medium" style={{ backgroundColor: primaryColor }}>
                                                    <Check className="w-4 h-4 inline mr-2" /> Attending
                                                </button>
                                                <button className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium">
                                                    <X className="w-4 h-4 inline mr-2" /> Not Attending
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeModal === "map" && (
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" style={{ color: primaryColor }} /> Location
                                        </h3>
                                        <div className="bg-gray-800 rounded-xl h-40 flex items-center justify-center text-gray-500">
                                            Google Maps Preview
                                        </div>
                                        <button className="mt-4 w-full py-3 rounded-xl bg-white/10 text-white flex items-center justify-center gap-2">
                                            <Navigation className="w-4 h-4" /> Get Directions
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PaymentSection() {
    const [isProcessing, setIsProcessing] = useState(false);
    const total = 134;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Pay with Billplz</h3>
                            <p className="text-sm text-foreground-muted">FPX, Credit Card, E-Wallets</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-background-tertiary rounded-lg text-center">
                            <Landmark className="w-4 h-4 text-primary mx-auto mb-1" />
                            <p className="text-xs text-foreground-muted">FPX</p>
                        </div>
                        <div className="p-3 bg-background-tertiary rounded-lg text-center">
                            <CreditCard className="w-4 h-4 text-primary mx-auto mb-1" />
                            <p className="text-xs text-foreground-muted">Card</p>
                        </div>
                        <div className="p-3 bg-background-tertiary rounded-lg text-center">
                            <Smartphone className="w-4 h-4 text-primary mx-auto mb-1" />
                            <p className="text-xs text-foreground-muted">E-Wallet</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4 border-warning/30 bg-warning/10">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="w-5 h-5 text-warning" />
                        <div>
                            <p className="text-warning font-medium">Sandbox Mode</p>
                            <p className="text-xs text-foreground-muted">This is a test payment.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-3 border-b border-[var(--glass-border)] pb-4 mb-4">
                    <div className="flex justify-between"><span className="text-foreground-muted">Premium Pack</span><span className="text-white">RM 99</span></div>
                    <div className="flex justify-between"><span className="text-foreground-muted">Extra 100 guests</span><span className="text-white">RM 20</span></div>
                    <div className="flex justify-between"><span className="text-foreground-muted">Custom domain</span><span className="text-white">RM 15</span></div>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-white">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">RM {total}</span>
                </div>
                <button disabled={isProcessing} className="btn-primary w-full">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Pay RM ${total}`}
                </button>
                <p className="text-xs text-foreground-muted text-center mt-4 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Secured by Billplz
                </p>
            </div>
        </div>
    );
}

function SendSection() {
    const [copied, setCopied] = useState(false);
    const inviteLink = "https://eventkad.my/i/ahmad-alia-2026";

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 border-success/30 bg-success/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                        <PartyPopper className="w-6 h-6 text-success" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-success">Ready to Share!</h3>
                        <p className="text-foreground-muted">Your invitation is now ready</p>
                    </div>
                </div>
            </div>
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Invitation Link</h3>
                <div className="flex gap-2">
                    <input type="text" value={inviteLink} readOnly className="input-field flex-1 text-primary" />
                    <button onClick={handleCopy} className="btn-primary flex items-center gap-2">
                        {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                    </button>
                </div>
            </div>
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Share Via</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { id: "whatsapp", name: "WhatsApp", Icon: MessageCircle },
                        { id: "email", name: "Email", Icon: Mail },
                        { id: "facebook", name: "Facebook", Icon: Facebook },
                        { id: "twitter", name: "Twitter", Icon: Twitter },
                    ].map((ch) => (
                        <button key={ch.id} className="p-4 rounded-xl bg-background-tertiary hover:bg-primary/20 transition-all text-center">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                                <ch.Icon className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-white font-medium text-sm">{ch.name}</p>
                        </button>
                    ))}
                </div>
            </div>
            <Link href="/dashboard" className="btn-primary w-full text-center block">Go to Dashboard</Link>
        </div>
    );
}

// ============= MAIN COMPONENT =============
function EventBuilderContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const eventId = (params?.id as string) || "new";

    // Read initial step from URL
    const initialStep = parseInt(searchParams.get("step") || "1", 10);
    const eventTypeFromUrl = searchParams.get("type") || "";
    const [currentStep, setCurrentStep] = useState(Math.min(Math.max(1, initialStep), STEPS.length));
    const [expandedStep, setExpandedStep] = useState(currentStep);
    const [eventData, setEventData] = useState<EventData>(() => ({
        ...initialEventData,
        eventType: eventTypeFromUrl,
    }));

    // Load event details from localStorage (saved from /events/create/details)
    useEffect(() => {
        const savedDetails = localStorage.getItem('eventDetails');
        if (savedDetails) {
            try {
                const details = JSON.parse(savedDetails);
                setEventData(prev => ({
                    ...prev,
                    eventName: details.eventName || "",
                    eventDate: details.date || "",
                    eventTime: details.time || "",
                    venue: details.venue || "",
                    address: details.address || "",
                    hostName: details.hostName || "",
                    coupleName1: details.coupleName1 || "",
                    coupleName2: details.coupleName2 || "",
                    celebrantName: details.celebrantName || "",
                    companyName: details.companyName || "",
                    parentsBride: details.parentsBride || "",
                    parentsGroom: details.parentsGroom || "",
                    description: details.description || "",
                    eventType: details.eventType || eventTypeFromUrl || "",
                    bridePhoto: details.bridePhoto || null,
                    groomPhoto: details.groomPhoto || null,
                    celebrantPhoto: details.celebrantPhoto || null,
                    babyPhoto: details.babyPhoto || null,
                    logoPhoto: details.logoPhoto || null,
                    hostPhoto: details.hostPhoto || null,
                }));
            } catch (e) {
                console.error('Error loading event details:', e);
            }
        }
    }, [eventTypeFromUrl]);

    const updateData = (updates: Partial<EventData>) => {
        setEventData(prev => ({ ...prev, ...updates }));
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
        setExpandedStep(step);
        // Update URL without full page reload
        const url = new URL(window.location.href);
        url.searchParams.set("step", step.toString());
        window.history.replaceState({}, "", url.toString());
    };

    const renderSection = (stepKey: string) => {
        switch (stepKey) {
            case "template": return <TemplateSection data={eventData} onChange={updateData} />;
            case "theme": return <ThemeSection data={eventData} onChange={updateData} />;
            case "music": return <MusicSection data={eventData} onChange={updateData} />;
            case "sections": return <SectionsSection data={eventData} onChange={updateData} />;
            case "contact": return <ContactSection data={eventData} onChange={updateData} />;
            case "itinerary": return <ItinerarySection data={eventData} onChange={updateData} />;
            case "gift": return <GiftSection data={eventData} onChange={updateData} />;
            case "preview": return <PreviewSection data={eventData} />;
            case "payment": return <PaymentSection />;
            case "send": return <SendSection />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Layout */}
            <div className="lg:hidden">
                {/* Mobile Progress Bar */}
                <div className="sticky top-0 z-50 bg-background-secondary/95 backdrop-blur-xl border-b border-[var(--glass-border)] p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Link href="/events" className="text-foreground-muted hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <span className="text-white font-medium">{STEPS[currentStep - 1]?.name}</span>
                        <span className="text-foreground-muted text-sm">{currentStep}/{STEPS.length}</span>
                    </div>
                    <div className="h-1 bg-background-tertiary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Mobile Accordion */}
                <div className="p-4 space-y-3">
                    {STEPS.map((step) => (
                        <div key={step.id} className="glass-card overflow-hidden">
                            <button
                                onClick={() => setExpandedStep(expandedStep === step.id ? 0 : step.id)}
                                className="w-full p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.id < currentStep
                                        ? "bg-success text-white"
                                        : step.id === currentStep
                                            ? "bg-primary text-white"
                                            : "bg-background-tertiary text-foreground-muted"
                                        }`}>
                                        {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                                    </div>
                                    <span className={`font-medium ${step.id <= currentStep ? "text-white" : "text-foreground-muted"}`}>
                                        {step.name}
                                    </span>
                                </div>
                                {expandedStep === step.id ? <ChevronUp className="w-5 h-5 text-foreground-muted" /> : <ChevronDown className="w-5 h-5 text-foreground-muted" />}
                            </button>
                            {expandedStep === step.id && (
                                <div className="p-4 pt-0 border-t border-[var(--glass-border)]">
                                    {renderSection(step.key)}
                                    <div className="flex gap-3 mt-6">
                                        {step.id > 1 && (
                                            <button onClick={() => goToStep(step.id - 1)} className="btn-secondary flex-1">
                                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                            </button>
                                        )}
                                        {step.id < STEPS.length && (
                                            <button onClick={() => goToStep(step.id + 1)} className="btn-primary flex-1">
                                                Continue <ArrowRight className="w-4 h-4 ml-2" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex min-h-screen">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-background-secondary border-r border-[var(--glass-border)] p-6 sticky top-0 h-screen overflow-y-auto">
                    <Link href="/events" className="flex items-center gap-2 text-foreground-muted hover:text-white mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Events
                    </Link>
                    <h2 className="text-lg font-bold text-white mb-6">Event Builder</h2>
                    <div className="space-y-2">
                        {STEPS.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => goToStep(step.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentStep === step.id
                                    ? "bg-primary/20 text-white"
                                    : "text-foreground-muted hover:bg-[var(--glass-bg)] hover:text-white"
                                    }`}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step.id < currentStep
                                    ? "bg-success text-white"
                                    : step.id === currentStep
                                        ? "bg-primary text-white"
                                        : "bg-background-tertiary"
                                    }`}>
                                    {step.id < currentStep ? <Check className="w-3 h-3" /> : step.id}
                                </div>
                                <span className="font-medium">{step.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">{STEPS[currentStep - 1]?.name}</h1>
                            <p className="text-foreground-muted">Step {currentStep} of {STEPS.length}</p>
                        </div>
                        {renderSection(STEPS[currentStep - 1]?.key || "template")}
                        <div className="flex gap-4 mt-8 pt-8 border-t border-[var(--glass-border)]">
                            {currentStep > 1 && (
                                <button onClick={() => goToStep(currentStep - 1)} className="btn-secondary flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Previous
                                </button>
                            )}
                            <div className="flex-1" />
                            {currentStep < STEPS.length && (
                                <button onClick={() => goToStep(currentStep + 1)} className="btn-primary flex items-center gap-2">
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EventBuilderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <EventBuilderContent />
        </Suspense>
    );
}
