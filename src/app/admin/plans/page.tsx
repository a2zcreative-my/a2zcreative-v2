"use client";

import {
    Package,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Loader2,
    AlertTriangle,
    Check,
    Star,
    GripVertical,
    Eye,
    EyeOff,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Plan {
    id: string;
    name: string;
    price: number;
    price_note: string;
    tagline: string;
    color: string;
    gradient: string;
    icon: string;
    events: string[];
    features: string[];
    notIncluded: string[];
    popular: boolean;
    active: boolean;
    sort_order: number;
}

const defaultPlan: Omit<Plan, 'id'> = {
    name: '',
    price: 0,
    price_note: 'one-time',
    tagline: '',
    color: 'primary',
    gradient: 'from-primary to-secondary',
    icon: 'Cake',
    events: [],
    features: [],
    notIncluded: [],
    popular: false,
    active: true,
    sort_order: 0,
};

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newPlanId, setNewPlanId] = useState('');

    // Form state for editing
    const [formData, setFormData] = useState<Omit<Plan, 'id'>>({ ...defaultPlan });
    const [featuresText, setFeaturesText] = useState('');
    const [eventsText, setEventsText] = useState('');
    const [notIncludedText, setNotIncludedText] = useState('');

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/plans');
            if (!response.ok) throw new Error('Failed to fetch plans');
            const data = await response.json();
            setPlans(data.plans || []);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const startEditing = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price,
            price_note: plan.price_note,
            tagline: plan.tagline,
            color: plan.color,
            gradient: plan.gradient,
            icon: plan.icon,
            events: plan.events,
            features: plan.features,
            notIncluded: plan.notIncluded,
            popular: plan.popular,
            active: plan.active,
            sort_order: plan.sort_order,
        });
        setFeaturesText(plan.features.join('\n'));
        setEventsText(plan.events.join('\n'));
        setNotIncludedText(plan.notIncluded.join('\n'));
        setIsCreating(false);
    };

    const startCreating = () => {
        setEditingPlan(null);
        setFormData({ ...defaultPlan });
        setFeaturesText('');
        setEventsText('');
        setNotIncludedText('');
        setNewPlanId('');
        setIsCreating(true);
    };

    const cancelEditing = () => {
        setEditingPlan(null);
        setIsCreating(false);
    };

    const savePlan = async () => {
        setSaving(true);
        try {
            const planData = {
                ...formData,
                features: featuresText.split('\n').filter(f => f.trim()),
                events: eventsText.split('\n').filter(e => e.trim()),
                notIncluded: notIncludedText.split('\n').filter(n => n.trim()),
            };

            if (isCreating) {
                if (!newPlanId.trim()) {
                    alert('Plan ID is required');
                    setSaving(false);
                    return;
                }
                const response = await fetch('/api/admin/plans', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: newPlanId, ...planData }),
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to create plan');
                }
            } else if (editingPlan) {
                const response = await fetch('/api/admin/plans', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingPlan.id, ...planData }),
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update plan');
                }
            }

            await fetchPlans();
            cancelEditing();
        } catch (err) {
            alert(String(err));
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (plan: Plan) => {
        try {
            const response = await fetch('/api/admin/plans', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: plan.id, active: !plan.active }),
            });
            if (response.ok) {
                await fetchPlans();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const togglePopular = async (plan: Plan) => {
        try {
            const response = await fetch('/api/admin/plans', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: plan.id, popular: !plan.popular }),
            });
            if (response.ok) {
                await fetchPlans();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deletePlan = async (plan: Plan) => {
        if (!confirm(`Are you sure you want to delete "${plan.name}"? This cannot be undone.`)) return;
        try {
            const response = await fetch(`/api/admin/plans?id=${plan.id}&hard=true`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchPlans();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Plans Management
                    </h1>
                    <p className="text-foreground-muted">
                        Manage pricing plans, features, and prices
                    </p>
                </div>
                <button
                    onClick={startCreating}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Plan
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-error/20 border border-error/50 rounded-xl p-6 text-center">
                    <AlertTriangle className="w-8 h-8 text-error mx-auto mb-2" />
                    <p className="text-error font-medium">Error Loading Plans</p>
                    <p className="text-error/70 text-sm">{error}</p>
                    <button onClick={fetchPlans} className="mt-4 px-4 py-2 bg-error/20 text-error rounded-lg hover:bg-error/30">
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="glass-card p-8 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-foreground-muted">Loading plans...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && plans.length === 0 && !isCreating && (
                <div className="glass-card p-8 text-center">
                    <Package className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Plans Found</h3>
                    <p className="text-foreground-muted mb-4">
                        Create your first pricing plan to get started
                    </p>
                    <button
                        onClick={startCreating}
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Create First Plan
                    </button>
                </div>
            )}

            {/* Edit/Create Form */}
            {(editingPlan || isCreating) && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">
                            {isCreating ? 'Create New Plan' : `Edit: ${editingPlan?.name}`}
                        </h2>
                        <button onClick={cancelEditing} className="p-2 hover:bg-white/10 rounded-lg">
                            <X className="w-5 h-5 text-foreground-muted" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Plan ID (only for new plans) */}
                        {isCreating && (
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">Plan ID</label>
                                <input
                                    type="text"
                                    value={newPlanId}
                                    onChange={(e) => setNewPlanId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                    placeholder="e.g., starter, premium"
                                    className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white"
                                />
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Plan Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Starter Pack"
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Price (RM)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                placeholder="20"
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white"
                            />
                        </div>

                        {/* Price Note */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Price Note</label>
                            <input
                                type="text"
                                value={formData.price_note}
                                onChange={(e) => setFormData({ ...formData, price_note: e.target.value })}
                                placeholder="one-time"
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white"
                            />
                        </div>

                        {/* Tagline */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Tagline</label>
                            <input
                                type="text"
                                value={formData.tagline}
                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                placeholder="I just need something fast & nice"
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white"
                            />
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Color Theme</label>
                            <select
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white"
                            >
                                <option value="starter">Starter (Green)</option>
                                <option value="basic">Basic (Blue)</option>
                                <option value="premium">Premium (Orange)</option>
                                <option value="exclusive">Exclusive (Pink)</option>
                                <option value="primary">Primary</option>
                            </select>
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Icon</label>
                            <select
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white"
                            >
                                <option value="Cake">Cake</option>
                                <option value="Heart">Heart</option>
                                <option value="Gem">Gem</option>
                                <option value="Crown">Crown</option>
                                <option value="Star">Star</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Sort Order</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white"
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.popular}
                                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-foreground">Popular Badge</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-foreground">Active</span>
                            </label>
                        </div>

                        {/* Events */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Perfect For (one per line)</label>
                            <textarea
                                value={eventsText}
                                onChange={(e) => setEventsText(e.target.value)}
                                rows={3}
                                placeholder="Birthday Party&#10;Wedding Reception&#10;Corporate Event"
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white resize-none"
                            />
                        </div>

                        {/* Features */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Features (one per line)</label>
                            <textarea
                                value={featuresText}
                                onChange={(e) => setFeaturesText(e.target.value)}
                                rows={5}
                                placeholder="1 page invitation&#10;Basic theme selection&#10;WhatsApp share link"
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white resize-none"
                            />
                        </div>

                        {/* Not Included */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground-muted mb-2">Not Included (one per line)</label>
                            <textarea
                                value={notIncludedText}
                                onChange={(e) => setNotIncludedText(e.target.value)}
                                rows={3}
                                placeholder="RSVP with guest count&#10;Google Maps&#10;Analytics"
                                className="w-full px-4 py-3 bg-background-secondary border border-[var(--glass-border)] rounded-xl text-white resize-none"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={cancelEditing}
                            className="px-6 py-3 bg-background-tertiary text-foreground-muted rounded-xl hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={savePlan}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Plan'}
                        </button>
                    </div>
                </div>
            )}

            {/* Plans Table */}
            {!loading && !error && plans.length > 0 && !editingPlan && !isCreating && (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--glass-border)]">
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Order</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Plan</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Price</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Features</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Status</th>
                                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map((plan) => (
                                    <tr key={plan.id} className={`border-b border-[var(--glass-border)] hover:bg-white/5 ${!plan.active ? 'opacity-50' : ''}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-foreground-muted">
                                                <GripVertical className="w-4 h-4" />
                                                {plan.sort_order}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-${plan.color}/20 flex items-center justify-center`}>
                                                    <Package className={`w-5 h-5 text-${plan.color}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-white">{plan.name}</p>
                                                        {plan.popular && (
                                                            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">POPULAR</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-foreground-muted">{plan.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-white">RM{plan.price}</p>
                                            <p className="text-xs text-foreground-muted">{plan.price_note}</p>
                                        </td>
                                        <td className="p-4 text-foreground-muted text-sm">
                                            {plan.features.length} features
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${plan.active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                                {plan.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEditing(plan)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => togglePopular(plan)}
                                                    className={`p-2 rounded-lg hover:bg-warning/20 transition-colors ${plan.popular ? 'text-warning' : 'text-foreground-muted hover:text-warning'}`}
                                                    title={plan.popular ? 'Remove Popular' : 'Set as Popular'}
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(plan)}
                                                    className={`p-2 rounded-lg transition-colors ${plan.active ? 'hover:bg-error/20 text-foreground-muted hover:text-error' : 'hover:bg-success/20 text-foreground-muted hover:text-success'}`}
                                                    title={plan.active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {plan.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => deletePlan(plan)}
                                                    className="p-2 rounded-lg hover:bg-error/20 text-foreground-muted hover:text-error transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
