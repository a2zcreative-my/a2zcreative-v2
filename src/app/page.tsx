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
  ArrowRight,
  Star
} from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";

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
    name: "Starter",
    price: 20,
    description: "Perfect for birthdays",
    features: [
      "1 Event Invitation",
      "2 Templates",
      "Up to 50 Guests",
      "Basic RSVP",
      "Valid for 14 days",
    ],
    popular: false,
  },
  {
    name: "Basic",
    price: 49,
    description: "Perfect for simple invitations",
    features: [
      "1 Event Invitation",
      "3 Templates",
      "Up to 100 Guests",
      "RSVP Tracking",
      "Valid for 30 days",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: 99,
    description: "Most popular choice",
    features: [
      "1 Event Invitation",
      "All Templates",
      "Up to 500 Guests",
      "RSVP Tracking",
      "Background Music",
      "Custom URL",
      "Gift Registry",
      "Valid for 90 days",
    ],
    popular: true,
  },
  {
    name: "Ultimate",
    price: 149,
    description: "For the perfect celebration",
    features: [
      "1 Event Invitation",
      "All Templates + Custom Design",
      "Unlimited Guests",
      "Everything in Premium",
      "Priority Support",
      "Valid for 1 year",
      "Multiple Events",
    ],
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Affordable Pricing
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto">
              Choose the perfect plan for your celebration. All prices in Malaysian Ringgit (RM).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`glass-card p-6 relative flex flex-col ${plan.popular ? 'border-primary ring-2 ring-primary/30' : ''
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-foreground-muted text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-foreground-muted">RM</span>
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      <span className="text-foreground-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/login?plan=${plan.name.toLowerCase()}`}
                  className={`w-full block text-center py-3 rounded-xl font-semibold transition-all mt-auto ${plan.popular
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-background-tertiary text-white hover:bg-primary/20'
                    }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
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
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--glass-border)]">
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
      </footer>
    </div>
  );
}
