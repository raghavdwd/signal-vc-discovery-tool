"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Building2,
    Sparkles,
    List,
    Bookmark,
    Radio,
    Zap,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useSignalStore } from "@/lib/stores";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/enrich", label: "Enrichment", icon: Sparkles },
    { href: "/lists", label: "Lists", icon: List },
    { href: "/saved", label: "Saved Searches", icon: Bookmark },
    { href: "/signals", label: "Signals", icon: Radio },
];

export function Sidebar() {
    const pathname = usePathname();
    const { preferences, toggleTheme, toggleSidebar, setCommandPaletteOpen } =
        useUIStore();
    const unreadCount = useSignalStore((s) => s.getUnreadCount());
    const collapsed = preferences.sidebar_collapsed;

    return (
        <aside
            className={cn(
                "flex h-screen flex-col border-r border-border bg-card transition-all duration-200 ease-out",
                collapsed ? "w-[68px]" : "w-[240px]"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                    <Zap className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-lg font-bold tracking-tight"
                    >
                        Signal
                    </motion.span>
                )}
            </div>

            {/* Search shortcut */}
            <div className="px-3 pt-4 pb-2">
                <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className={cn(
                        "flex w-full items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-ring",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <Search className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">Search…</span>
                            <kbd className="mono pointer-events-none rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                ⌘K
                            </kbd>
                        </>
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-2" role="navigation">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        pathname === item.href || pathname?.startsWith(item.href + "/");
                    const Icon = item.icon;
                    const showBadge = item.href === "/signals" && unreadCount > 0;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-ring",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                collapsed && "justify-center px-0"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 rounded-lg bg-primary/10"
                                    transition={{ type: "spring", duration: 0.3 }}
                                />
                            )}
                            <Icon
                                className={cn(
                                    "relative h-[18px] w-[18px] shrink-0",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            />
                            {!collapsed && (
                                <span className="relative">{item.label}</span>
                            )}
                            {showBadge && (
                                <span
                                    className={cn(
                                        "relative flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground",
                                        collapsed && "absolute -right-1 -top-1 h-4 min-w-[16px] text-[9px]"
                                    )}
                                >
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom actions */}
            <div className="border-t border-border p-3 space-y-1">
                <button
                    onClick={toggleTheme}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
                        collapsed && "justify-center px-0"
                    )}
                    aria-label="Toggle theme"
                >
                    {preferences.theme === "dark" ? (
                        <Sun className="h-[18px] w-[18px]" />
                    ) : (
                        <Moon className="h-[18px] w-[18px]" />
                    )}
                    {!collapsed && (
                        <span>{preferences.theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    )}
                </button>

                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
                        collapsed && "justify-center px-0"
                    )}
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? (
                        <ChevronRight className="h-[18px] w-[18px]" />
                    ) : (
                        <ChevronLeft className="h-[18px] w-[18px]" />
                    )}
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
