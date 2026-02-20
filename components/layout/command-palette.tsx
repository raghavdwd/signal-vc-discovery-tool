"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    Search,
    LayoutDashboard,
    Sparkles,
    List,
    Radio,
    Bookmark,
    X,
} from "lucide-react";
import { useCompanyStore, useUIStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

export function CommandPalette() {
    const router = useRouter();
    const { companies } = useCompanyStore();
    const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

    // Cmd+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setCommandPaletteOpen(!commandPaletteOpen);
            }
            if (e.key === "Escape") {
                setCommandPaletteOpen(false);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [commandPaletteOpen, setCommandPaletteOpen]);

    const navigate = (href: string) => {
        router.push(href);
        setCommandPaletteOpen(false);
    };

    return (
        <AnimatePresence>
            {commandPaletteOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={() => setCommandPaletteOpen(false)}
                    />

                    {/* Command dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed left-1/2 top-[20%] z-50 w-full max-w-[560px] -translate-x-1/2"
                    >
                        <Command
                            className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
                            label="Global search"
                        >
                            <div className="flex items-center gap-2 border-b border-border px-4">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Command.Input
                                    placeholder="Search companies, navigate, or run actions..."
                                    className="flex-1 bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                />
                                <button
                                    onClick={() => setCommandPaletteOpen(false)}
                                    className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <Command.List className="max-h-[360px] overflow-y-auto px-2 py-2">
                                <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                                    No results found.
                                </Command.Empty>

                                {/* Navigation */}
                                <Command.Group
                                    heading="Navigation"
                                    className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
                                >
                                    {[
                                        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
                                        { label: "Companies", href: "/companies", icon: Building2 },
                                        { label: "Enrichment", href: "/enrich", icon: Sparkles },
                                        { label: "Lists", href: "/lists", icon: List },
                                        { label: "Saved Searches", href: "/saved", icon: Bookmark },
                                        { label: "Signals", href: "/signals", icon: Radio },
                                    ].map((item) => (
                                        <Command.Item
                                            key={item.href}
                                            onSelect={() => navigate(item.href)}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors data-[selected=true]:bg-secondary"
                                        >
                                            <item.icon className="h-4 w-4 text-muted-foreground" />
                                            {item.label}
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                {/* Companies */}
                                <Command.Group
                                    heading="Companies"
                                    className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
                                >
                                    {companies.slice(0, 10).map((company) => (
                                        <Command.Item
                                            key={company.id}
                                            value={`${company.name} ${company.sector} ${company.tags.join(" ")}`}
                                            onSelect={() => navigate(`/companies/${company.id}`)}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors data-[selected=true]:bg-secondary"
                                        >
                                            <div
                                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                                                style={{
                                                    background: `linear-gradient(135deg, ${company.logo_gradient[0]}, ${company.logo_gradient[1]})`,
                                                }}
                                            >
                                                {company.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium">{company.name}</span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {company.funding_stage} · {company.sector}
                                                </span>
                                            </div>
                                        </Command.Item>
                                    ))}
                                </Command.Group>
                            </Command.List>

                            <div className="border-t border-border px-4 py-2">
                                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <kbd className="mono rounded border border-border px-1 py-0.5">↑↓</kbd>
                                        Navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="mono rounded border border-border px-1 py-0.5">↵</kbd>
                                        Select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="mono rounded border border-border px-1 py-0.5">esc</kbd>
                                        Close
                                    </span>
                                </div>
                            </div>
                        </Command>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
