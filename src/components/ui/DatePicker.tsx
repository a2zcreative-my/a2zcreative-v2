"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({ value, onChange, className = "", placeholder = "Select date" }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the value (YYYY-MM-DD format) to Date
    const selectedDate = value ? new Date(value + "T00:00:00") : null;

    // Initialize view to selected date's month/year
    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(selectedDate.getMonth());
            setCurrentYear(selectedDate.getFullYear());
        }
    }, []);

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

    // Get days in month
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month (0 = Sunday)
    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Generate calendar grid
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days: (number | null)[] = [];

        // Add empty cells for days before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add the days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    // Handle date selection
    const handleDateClick = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    // Navigate months
    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Format display value
    const formatDisplayValue = () => {
        if (!selectedDate) return "";
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const month = MONTHS[selectedDate.getMonth()].substring(0, 3);
        const year = selectedDate.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Check if a day is selected
    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear
        );
    };

    // Check if a day is today
    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear
        );
    };

    const days = generateCalendarDays();

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="input-field w-full flex items-center gap-3 text-left cursor-pointer hover:border-primary/50 transition-colors"
            >
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <span className={selectedDate ? "text-foreground" : "text-foreground-muted"}>
                    {formatDisplayValue() || placeholder}
                </span>
            </button>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-72 p-4 animate-fade-in shadow-2xl rounded-2xl bg-[#1a1a2e] border border-primary/20" style={{ boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(255,255,255,0.05)' }}>
                    {/* Month/Year Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-foreground-muted hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-white">
                            {MONTHS[currentMonth]} {currentYear}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-foreground-muted hover:text-white"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-foreground-muted py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => (
                            <div key={index} className="aspect-square">
                                {day !== null && (
                                    <button
                                        type="button"
                                        onClick={() => handleDateClick(day)}
                                        className={`w-full h-full rounded-lg text-sm font-medium transition-all duration-200
                                            ${isSelected(day)
                                                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                                                : isToday(day)
                                                    ? "bg-white/10 text-primary ring-1 ring-primary/50"
                                                    : "text-foreground hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        {day}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-3 border-t border-[var(--glass-border)] flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                                onChange(dateStr);
                                setIsOpen(false);
                            }}
                            className="flex-1 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange("");
                                setIsOpen(false);
                            }}
                            className="flex-1 py-2 text-xs font-medium text-foreground-muted hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
