"use client";

import Link from "next/link";

interface Step {
    number: number;
    name: string;
    path: string;
}

interface StepIndicatorProps {
    currentStep: number;
    eventId?: string;
    steps?: Step[];
}

const defaultSteps: Step[] = [
    { number: 1, name: "Template", path: "template" },
    { number: 2, name: "Theme", path: "theme" },
    { number: 3, name: "Music", path: "music" },
    { number: 4, name: "Sections", path: "sections" },
    { number: 5, name: "Contact", path: "contact" },
    { number: 6, name: "Itinerary", path: "itinerary" },
    { number: 7, name: "Gift", path: "gift" },
    { number: 8, name: "Guests", path: "guests" },
    { number: 9, name: "Preview", path: "preview" },
    { number: 10, name: "Payment", path: "payment" },
    { number: 11, name: "Send", path: "send" },
];

export default function StepIndicator({ currentStep, eventId = "new", steps = defaultSteps }: StepIndicatorProps) {
    return (
        <div className="w-full max-w-4xl mx-auto mb-8">
            {/* Progress Bar Container */}
            <div className="relative">
                {/* Background Line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-background-tertiary" />

                {/* Progress Line */}
                <div
                    className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {/* Steps - ALL are clickable for free navigation */}
                <div className="relative flex justify-between">
                    {steps.map((step) => {
                        const isCompleted = step.number < currentStep;
                        const isCurrent = step.number === currentStep;
                        const isFuture = step.number > currentStep;

                        return (
                            <Link
                                key={step.number}
                                href={`/events/${eventId}/${step.path}`}
                                className="no-underline"
                                title={`Go to ${step.name}`}
                            >
                                <div className="flex flex-col items-center group cursor-pointer">
                                    {/* Step Circle */}
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${isCompleted
                                                ? "bg-success text-white group-hover:ring-4 group-hover:ring-success/30"
                                                : isCurrent
                                                    ? "bg-primary text-white ring-4 ring-primary/30 group-hover:ring-primary/50"
                                                    : "bg-background-tertiary text-foreground-muted group-hover:bg-primary/20 group-hover:text-primary group-hover:ring-4 group-hover:ring-primary/20"
                                            }`}
                                    >
                                        {isCompleted ? "✓" : step.number}
                                    </div>

                                    {/* Step Label */}
                                    <span
                                        className={`mt-2 text-xs font-medium text-center max-w-[60px] transition-colors ${isCompleted
                                                ? "text-success group-hover:text-success/80"
                                                : isCurrent
                                                    ? "text-white"
                                                    : "text-foreground-muted group-hover:text-primary"
                                            } ${Math.abs(step.number - currentStep) > 1 ? "hidden md:block" : ""}`}
                                    >
                                        {step.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
