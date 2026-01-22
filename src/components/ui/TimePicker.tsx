"use client";

import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    use24Hour?: boolean;
}

export default function TimePicker({
    value,
    onChange,
    className = "",
    placeholder = "Select time",
    use24Hour = false
}: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);

    // Parse the value (HH:MM format)
    const parseTime = () => {
        if (!value) return { hour: 12, minute: 0, period: "AM" as "AM" | "PM" };
        const [hourStr, minuteStr] = value.split(":");
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        let period: "AM" | "PM" = "AM";

        if (!use24Hour) {
            if (hour >= 12) {
                period = "PM";
                if (hour > 12) hour -= 12;
            }
            if (hour === 0) hour = 12;
        }

        return { hour, minute, period };
    };

    const { hour: selectedHour, minute: selectedMinute, period: selectedPeriod } = parseTime();
    const [period, setPeriod] = useState<"AM" | "PM">(selectedPeriod);

    // Update period when value changes
    useEffect(() => {
        const { period: newPeriod } = parseTime();
        setPeriod(newPeriod);
    }, [value]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll selected items into view when opening
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                hourRef.current?.querySelector("[data-selected='true']")?.scrollIntoView({
                    block: "center",
                    behavior: "smooth"
                });
                minuteRef.current?.querySelector("[data-selected='true']")?.scrollIntoView({
                    block: "center",
                    behavior: "smooth"
                });
            }, 50);
        }
    }, [isOpen]);

    // Generate hours
    const hours = use24Hour
        ? Array.from({ length: 24 }, (_, i) => i)
        : Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);

    // Generate minutes (every 5 minutes for easier selection)
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    // Handle time selection
    const handleTimeSelect = (newHour: number, newMinute: number, newPeriod: "AM" | "PM") => {
        let hour24 = newHour;

        if (!use24Hour) {
            if (newPeriod === "PM" && newHour !== 12) {
                hour24 = newHour + 12;
            } else if (newPeriod === "AM" && newHour === 12) {
                hour24 = 0;
            }
        }

        const timeStr = `${String(hour24).padStart(2, "0")}:${String(newMinute).padStart(2, "0")}`;
        onChange(timeStr);
    };

    // Format display value
    const formatDisplayValue = () => {
        if (!value) return "";
        const { hour, minute, period } = parseTime();

        if (use24Hour) {
            return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        }
        return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="input-field w-full flex items-center gap-3 text-left cursor-pointer hover:border-primary/50 transition-colors"
            >
                <Clock className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className={value ? "text-foreground" : "text-foreground-muted"}>
                    {formatDisplayValue() || placeholder}
                </span>
            </button>

            {/* Dropdown Time Picker */}
            {isOpen && (
                <div className="absolute z-50 mt-2 p-4 animate-fade-in shadow-2xl rounded-2xl bg-[#1a1a2e] border border-secondary/20" style={{ boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(255,255,255,0.05)' }}>
                    <div className="flex gap-2">
                        {/* Hour Column */}
                        <div className="flex flex-col">
                            <span className="text-xs text-foreground-muted text-center mb-2 font-medium">Hour</span>
                            <div
                                ref={hourRef}
                                className="h-40 w-16 overflow-y-auto scrollbar-thin rounded-lg bg-background-secondary/50"
                            >
                                {hours.map((h) => (
                                    <button
                                        key={h}
                                        type="button"
                                        data-selected={h === selectedHour}
                                        onClick={() => handleTimeSelect(h, selectedMinute, period)}
                                        className={`w-full py-2 text-center text-sm font-medium transition-all
                                            ${h === selectedHour
                                                ? "bg-gradient-to-r from-primary to-secondary text-white"
                                                : "text-foreground hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        {use24Hour ? String(h).padStart(2, "0") : h}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="flex items-center text-2xl font-bold text-foreground-muted pt-6">:</div>

                        {/* Minute Column */}
                        <div className="flex flex-col">
                            <span className="text-xs text-foreground-muted text-center mb-2 font-medium">Min</span>
                            <div
                                ref={minuteRef}
                                className="h-40 w-16 overflow-y-auto scrollbar-thin rounded-lg bg-background-secondary/50"
                            >
                                {minutes.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        data-selected={m === selectedMinute}
                                        onClick={() => handleTimeSelect(selectedHour, m, period)}
                                        className={`w-full py-2 text-center text-sm font-medium transition-all
                                            ${m === selectedMinute
                                                ? "bg-gradient-to-r from-primary to-secondary text-white"
                                                : "text-foreground hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        {String(m).padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AM/PM Toggle (only for 12-hour mode) */}
                        {!use24Hour && (
                            <div className="flex flex-col">
                                <span className="text-xs text-foreground-muted text-center mb-2 font-medium">Period</span>
                                <div className="flex flex-col gap-1">
                                    {(["AM", "PM"] as const).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => {
                                                setPeriod(p);
                                                handleTimeSelect(selectedHour, selectedMinute, p);
                                            }}
                                            className={`px-4 py-4 rounded-lg text-sm font-bold transition-all
                                                ${period === p
                                                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                                                    : "bg-background-secondary/50 text-foreground-muted hover:bg-white/10 hover:text-white"
                                                }
                                            `}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Times */}
                    <div className="mt-4 pt-3 border-t border-[var(--glass-border)]">
                        <div className="text-xs text-foreground-muted mb-2">Quick select:</div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "9 AM", time: "09:00" },
                                { label: "12 PM", time: "12:00" },
                                { label: "3 PM", time: "15:00" },
                                { label: "6 PM", time: "18:00" },
                            ].map((preset) => (
                                <button
                                    key={preset.time}
                                    type="button"
                                    onClick={() => {
                                        onChange(preset.time);
                                        setIsOpen(false);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-primary/20 text-foreground-muted hover:text-primary transition-colors"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
