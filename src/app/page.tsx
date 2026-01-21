import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Heart,
  Zap,
  Globe,
  Users,
  Palette,
  Music,
  MapPin,
  Gift,
  Send,
  Check,
  X,
  ArrowRight,
  Star,
  Cake,
  Gem,
  Crown
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";

const planIcons: Record<string, LucideIcon> = {
  starter: Cake,
  basic: Heart,
  premium: Gem,
  exclusive: Crown,
};

const features = [
  {
    icon: Palette,
    title: "Beautiful Templates",
    description: "Choose from stunning designs for weddings, engagements, and more."
  },
  {
    icon: Music,
    title: "Background Music",
    description: "Set the mood with beautiful background music for your invitation."
  },
  {
    icon: MapPin,
    title: "Google Maps & Waze",
    description: "Guests can easily navigate to your venue with integrated maps."
  },
  {
    icon: Users,
    title: "RSVP Management",
    description: "Track guest attendance and manage your guest list easily."
  },
  {
    icon: Gift,
    title: "Digital Gift Registry",
    description: "Accept bank transfers and e-wallet gifts seamlessly."
  },
  {
    icon: Globe,
    title: "Custom URL",
    description: "Get your own personalized link like yourname.a2zcreative.com.my"
  },
];

const pricingPlans = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 20,
    priceNote: "one-time",
    tagline: "I just need something fast & nice",
    color: "starter",
    gradient: "from-starter to-green-600",
    events: ["Birthday Party", "Aqiqah / Doa Selamat", "Housewarming", "Small family gathering", "Simple surprise party"],
    features: [
      "1 page invitation",
      "Basic theme selection",
      "Event details display",
      "WhatsApp share link",
      "Simple \"I'm attending\" button",
    ],
    notIncluded: ["RSVP with guest count", "Google Maps", "Theme customization", "Analytics"],
    popular: false,
  },
  {
    id: "basic",
    name: "Basic Pack",
    price: 49,
    priceNote: "one-time",
    tagline: "I want it to look proper & organized",
    color: "basic",
    gradient: "from-basic to-blue-600",
    events: ["Engagement / Nikah", "Graduation celebration", "Family reunion", "Kenduri kecil", "Religious talks"],
    features: [
      "RSVP with guest count",
      "Google Maps integration",
      "Date countdown timer",
      "Multiple sections (Tentative, Location, Contact)",
      "Theme customization (color / font)",
    ],
    notIncluded: ["Custom domain", "Photo gallery", "Analytics"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Pack",
    price: 99,
    priceNote: "one-time",
    tagline: "This event represents me / us",
    color: "premium",
    gradient: "from-premium to-orange-600",
    events: ["Wedding reception", "Corporate event", "Product launch", "Annual dinner", "Seminar / workshop"],
    features: [
      "Custom domain/subdomain",
      "Photo & video gallery",
      "Advanced RSVP (diet, pax, notes)",
      "Calendar sync",
      "Analytics (views, attendance)",
      "Background music / animation",
    ],
    notIncluded: ["QR Check-in", "Multiple invite links"],
    popular: false,
  },
  {
    id: "exclusive",
    name: "Exclusive Plan",
    price: 199.99,
    priceNote: "one-time",
    tagline: "This event must look elite & controlled",
    color: "exclusive",
    gradient: "from-exclusive to-pink-600",
    events: ["VIP / Royal-style wedding", "Private gala dinner", "Conference / summit", "Government / NGO events", "Invite-only exclusive events"],
    features: [
      "Organizer dashboard",
      "Multiple invitation links (VIP / Public / Staff)",
      "QR check-in system",
      "Guest approval system",
      "Custom branding (logo, colors)",
      "Priority support",
      "Export guest data (Excel)",
    ],
    notIncluded: [],
    popular: false,
  },
];

const testimonials = [
  {
    name: "Ahmad & Sarah",
    event: "Wedding Reception",
    message: "Our guests loved the digital invitation! So easy to share and the RSVP feature saved us so much time.",
    rating: 5,
  },
  {
    name: "Farah & Imran",
    event: "Engagement Ceremony",
    message: "Beautiful design and the door animation made our invitation so special. Highly recommended!",
    rating: 5,
  },
  {
    name: "Aisha & Hafiz",
    event: "Walimatul Urus",
    message: "Professional looking invitation at an affordable price. The Waze integration was a lifesaver for our guests!",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto">
              Create professional digital invitations with all the features your guests will love.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-6 hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-foreground-muted text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-background-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Select the perfect package for your event. <span className="text-primary">The more important the event, the higher the plan.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => {
              const PlanIcon = planIcons[plan.id] || Cake;
              return (
                <div
                  key={plan.id}
                  className={`glass-card p-6 relative flex flex-col h-full transition-all duration-300 hover:border-white/20 ${plan.popular ? 'ring-2 ring-basic shadow-lg shadow-basic/20' : ''
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-basic text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                      <PlanIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-foreground-muted italic">&quot;{plan.tagline}&quot;</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <span className={`text-4xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      RM{plan.price}
                    </span>
                    <span className="text-sm text-foreground-muted ml-1">{plan.priceNote}</span>
                  </div>

                  {/* Suitable Events */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-2">
                      Perfect for:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {plan.events.slice(0, 3).map((event) => (
                        <span key={event} className="text-xs bg-background-tertiary text-foreground-muted px-2 py-1 rounded-lg">
                          {event}
                        </span>
                      ))}
                      {plan.events.length > 3 && (
                        <span className="text-xs text-foreground-muted px-2 py-1">
                          +{plan.events.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.slice(0, 2).map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <X className="w-4 h-4 text-foreground-muted mt-0.5 shrink-0" />
                        <span className="text-foreground-muted">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Get Started Button */}
                  <Link
                    href={`/auth/login?plan=${plan.id}`}
                    className={`w-full block text-center py-3 rounded-xl font-semibold transition-all mt-auto bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90`}
                  >
                    Get Started
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by Couples
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto">
              See what our happy customers have to say about A2ZCreative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-foreground-muted text-sm mb-4">"{testimonial.message}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-foreground-muted text-sm">{testimonial.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
            <div className="relative z-10">
              <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Create Your Invitation?
              </h2>
              <p className="text-foreground-muted mb-8 max-w-xl mx-auto">
                Join thousands of couples who have made their celebration special with A2ZCreative.
              </p>
              <Link href="/auth/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="py-12 px-6 border-t border-[var(--glass-border)]" >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="A2ZCreative" width={32} height={32} className="rounded-lg" />
                <span className="text-xl font-bold text-white">A2ZCreative</span>
              </Link>
              <p className="text-foreground-muted text-sm mb-4 max-w-sm">
                Create beautiful digital invitations for your special moments. Proudly made in Malaysia.
              </p>
              <p className="text-foreground-muted text-sm">
                Powered by <span className="text-primary font-semibold">A2Z Creative</span>
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-foreground-muted hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-foreground-muted hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/ahmad-alia" className="text-foreground-muted hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-foreground-muted hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-foreground-muted hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-foreground-muted hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--glass-border)] text-center text-sm text-foreground-muted">
            © 2026 A2Z Creative. All rights reserved.
          </div>
        </div>
      </footer >
    </div >
  );
}
