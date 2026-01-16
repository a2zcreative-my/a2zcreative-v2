"use client";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { useState, use } from "react";
import StepIndicator from "@/components/StepIndicator";

interface ItineraryItem {
    id: string;
    time: string;
    activity: string;
    location: string;
}

export default function ItineraryPage() {
    const params = useParams(); const id = params?.id as string;
    const [items, setItems] = useState<ItineraryItem[]>([
        { id: "1", time: "11:00", activity: "Guest Arrival", location: "" },
        { id: "2", time: "12:00", activity: "Ceremony Begins", location: "" },
        { id: "3", time: "13:00", activity: "Lunch", location: "" },
        { id: "4", time: "15:00", activity: "Photo Session", location: "" },
    ]);

    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), time: "", activity: "", location: "" }]);
    };

    const removeItem = (itemId: string) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== itemId));
        }
    };

    const updateItem = (itemId: string, field: string, value: string) => {
        setItems(items.map(i =>
            i.id === itemId ? { ...i, [field]: value } : i
        ));
    };

    const handleDragStart = (itemId: string) => {
        setDraggedItem(itemId);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === targetId) return;

        const draggedIndex = items.findIndex(i => i.id === draggedItem);
        const targetIndex = items.findIndex(i => i.id === targetId);

        const newItems = [...items];
        const [removed] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, removed);
        setItems(newItems);
    };

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={6} eventId={id} />

            {/* Header */}
            <div className="max-w-3xl mx-auto mb-8">
                <Link href={`/events/${id}/contact`} className="text-foreground-muted hover:text-white text-sm flex items-center gap-2 mb-4">
                    ← Back to Contact
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Itinerary / Tentative 🗓️</h1>
                <p className="text-foreground-muted">Create a timeline for your event</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDragEnd={() => setDraggedItem(null)}
                        className={`glass-card p-4 cursor-move transition-all ${draggedItem === item.id ? "opacity-50 scale-95" : ""
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Drag Handle */}
                            <div className="text-foreground-muted mt-3 cursor-grab">
                                ⋮⋮
                            </div>

                            {/* Timeline Indicator */}
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </div>
                                {index < items.length - 1 && (
                                    <div className="w-0.5 h-12 bg-[var(--glass-border)] mt-2" />
                                )}
                            </div>

                            {/* Input Fields */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-foreground-muted block mb-1">Time *</label>
                                    <input
                                        type="time"
                                        value={item.time}
                                        onChange={(e) => updateItem(item.id, "time", e.target.value)}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs text-foreground-muted block mb-1">Activity *</label>
                                    <input
                                        type="text"
                                        value={item.activity}
                                        onChange={(e) => updateItem(item.id, "activity", e.target.value)}
                                        placeholder="e.g., Guest Arrival"
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="text-xs text-foreground-muted block mb-1">Location (Optional)</label>
                                    <input
                                        type="text"
                                        value={item.location}
                                        onChange={(e) => updateItem(item.id, "location", e.target.value)}
                                        placeholder="e.g., Main Hall"
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>

                            {/* Remove Button */}
                            {items.length > 1 && (
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-foreground-muted hover:text-error mt-3"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add Item Button */}
                <button
                    onClick={addItem}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-[var(--glass-border)] text-foreground-muted hover:text-white hover:border-primary transition-colors flex items-center justify-center gap-2"
                >
                    ➕ Add Timeline Item
                </button>

                {/* Tip */}
                <div className="glass-card p-4 border-info/30 bg-info/5">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">💡</span>
                        <p className="text-sm text-foreground-muted">
                            <strong className="text-white">Tip:</strong> Drag items to reorder your timeline
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 pt-4">
                    <Link href={`/events/${id}/contact`} className="btn-secondary flex-1 text-center">
                        ← Back
                    </Link>
                    <Link href={`/events/${id}/gift`} className="btn-primary flex-1 text-center">
                        Continue to Gift Details →
                    </Link>
                </div>
            </div>
        </div>
    );
}


