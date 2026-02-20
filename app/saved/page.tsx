"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Bookmark,
    Bell,
    BellOff,
    Trash2,
    Play,
    Clock,
    Search,
    Filter,
    Plus,
} from "lucide-react";
import { useSavedSearchStore, useCompanyStore } from "@/lib/stores";
import { cn, timeAgo } from "@/lib/utils";
import type { FilterState, FundingStage, Sector } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SavedSearchesPage() {
    const router = useRouter();
    const { searches, history, deleteSearch, toggleAlerts, saveSearch } = useSavedSearchStore();
    const { companies } = useCompanyStore();
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState("");

    const getMatchCount = (filters: FilterState) => {
        let result = companies;

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q)
            );
        }
        if (filters.funding_stages.length > 0) {
            result = result.filter((c) => filters.funding_stages.includes(c.funding_stage));
        }
        if (filters.sectors.length > 0) {
            result = result.filter((c) => filters.sectors.includes(c.sector));
        }
        return result.length;
    };

    const handleRun = (filters: FilterState) => {
        // Navigate to companies page - filters would be applied via URL params in production
        router.push("/companies");
        toast.success("Search executed — redirecting to Companies");
    };

    const filtersToLabel = (filters: FilterState): string => {
        const parts: string[] = [];
        if (filters.search) parts.push(`"${filters.search}"`);
        if (filters.funding_stages.length) parts.push(filters.funding_stages.join(", "));
        if (filters.sectors.length) parts.push(filters.sectors.join(", "));
        if (filters.locations.length) parts.push(filters.locations.join(", "));
        if (filters.recently_enriched) parts.push("Recently enriched");
        return parts.length > 0 ? parts.join(" · ") : "All companies";
    };

    // Quick save presets
    const PRESETS = [
        { name: "Series A AI Companies", filters: { ...getDefaultFilters(), funding_stages: ["Series A" as FundingStage], sectors: ["AI/ML" as Sector] } },
        { name: "High-Growth Fintech", filters: { ...getDefaultFilters(), sectors: ["Fintech" as Sector], funding_min: 50 } },
        { name: "Climate Tech Seed Stage", filters: { ...getDefaultFilters(), sectors: ["Climate" as Sector], funding_stages: ["Seed" as FundingStage, "Pre-Seed" as FundingStage] } },
        { name: "Recently Enriched", filters: { ...getDefaultFilters(), recently_enriched: true } },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold tracking-tight"
                    >
                        Saved Searches
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-1 text-muted-foreground"
                    >
                        Save filter combinations for quick access and alerts
                    </motion.p>
                </div>
            </div>

            {/* Quick presets */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick Presets
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {PRESETS.map((preset) => {
                        const count = getMatchCount(preset.filters);
                        const alreadySaved = searches.some((s) => s.name === preset.name);
                        return (
                            <button
                                key={preset.name}
                                onClick={() => {
                                    if (!alreadySaved) {
                                        saveSearch(preset.name, preset.filters, count);
                                        toast.success(`Saved "${preset.name}"`);
                                    } else {
                                        toast.info("Already saved");
                                    }
                                }}
                                className={cn(
                                    "rounded-xl border p-4 text-left transition-all card-hover",
                                    alreadySaved
                                        ? "border-primary/20 bg-primary/5"
                                        : "border-border bg-card"
                                )}
                            >
                                <p className="text-sm font-semibold">{preset.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {count} matching companies
                                </p>
                                <div className="mt-3">
                                    {alreadySaved ? (
                                        <span className="text-xs text-primary">✓ Saved</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Plus className="h-3 w-3" /> Save preset
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Saved searches list */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Saved Searches ({searches.length})
                </h2>

                {searches.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center rounded-xl border border-border bg-card">
                        <Bookmark className="h-10 w-10 text-muted-foreground/30" />
                        <h3 className="mt-3 font-semibold">No saved searches</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Save a preset above or create a custom search
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {searches.map((search) => (
                            <motion.div
                                key={search.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl border border-border bg-card p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{search.name}</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {filtersToLabel(search.filters)}
                                        </p>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Search className="h-3 w-3" />
                                                {getMatchCount(search.filters)} matches
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Created {timeAgo(search.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRun(search.filters)}
                                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                        >
                                            <Play className="h-3 w-3" />
                                            Run
                                        </button>
                                        <button
                                            onClick={() => {
                                                toggleAlerts(search.id);
                                                toast.success(
                                                    search.alerts_enabled
                                                        ? "Alerts disabled"
                                                        : "Alerts enabled"
                                                );
                                            }}
                                            className={cn(
                                                "rounded-lg border p-1.5 transition-colors",
                                                search.alerts_enabled
                                                    ? "border-primary/30 bg-primary/10 text-primary"
                                                    : "border-border text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {search.alerts_enabled ? (
                                                <Bell className="h-3.5 w-3.5" />
                                            ) : (
                                                <BellOff className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                deleteSearch(search.id);
                                                toast.success("Search deleted");
                                            }}
                                            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive hover:border-red-500/20 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function getDefaultFilters(): FilterState {
    return {
        search: "",
        funding_stages: [],
        sectors: [],
        funding_min: 0,
        funding_max: 1000,
        locations: [],
        tags: [],
        recently_enriched: false,
    };
}
