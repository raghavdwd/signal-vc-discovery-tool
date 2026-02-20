"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Radio,
    Filter,
    TrendingUp,
    DollarSign,
    Users,
    Code,
    Briefcase,
    FileText,
    GitBranch,
    Zap,
    CheckCheck,
    Bell,
    Settings,
    Eye,
    EyeOff,
} from "lucide-react";
import { useSignalStore, useCompanyStore } from "@/lib/stores";
import { cn, timeAgo, SIGNAL_TYPE_CONFIG } from "@/lib/utils";
import type { SignalType } from "@/types";
import { toast } from "sonner";

const SIGNAL_ICONS: Record<SignalType, React.ElementType> = {
    hiring_spike: TrendingUp,
    new_funding: DollarSign,
    leadership_change: Users,
    tech_stack_update: Code,
    careers_page: Briefcase,
    blog_active: FileText,
    changelog_present: GitBranch,
    growth_signal: Zap,
};

export default function SignalsPage() {
    const { signals, markRead, markAllRead, getUnreadCount } = useSignalStore();
    const { companies } = useCompanyStore();
    const [filterType, setFilterType] = useState<SignalType | "all">("all");
    const [filterSeverity, setFilterSeverity] = useState<string>("all");
    const [showRead, setShowRead] = useState(true);

    const filteredSignals = useMemo(() => {
        let result = [...signals];
        if (filterType !== "all") {
            result = result.filter((s) => s.type === filterType);
        }
        if (filterSeverity !== "all") {
            result = result.filter((s) => s.severity === filterSeverity);
        }
        if (!showRead) {
            result = result.filter((s) => !s.read);
        }
        return result;
    }, [signals, filterType, filterSeverity, showRead]);

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        signals.forEach((s) => {
            counts[s.type] = (counts[s.type] || 0) + 1;
        });
        return counts;
    }, [signals]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold tracking-tight"
                    >
                        Signals Intelligence
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-1 text-muted-foreground"
                    >
                        {getUnreadCount()} unread signals · {signals.length} total
                    </motion.p>
                </div>
                <button
                    onClick={() => {
                        markAllRead();
                        toast.success("All signals marked as read");
                    }}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                </button>
            </div>

            {/* Signal type filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterType("all")}
                    className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                        filterType === "all"
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                >
                    All ({signals.length})
                </button>
                {(Object.keys(SIGNAL_TYPE_CONFIG) as SignalType[]).map((type) => {
                    const config = SIGNAL_TYPE_CONFIG[type];
                    const count = typeCounts[type] || 0;
                    if (count === 0) return null;
                    const Icon = SIGNAL_ICONS[type];
                    return (
                        <button
                            key={type}
                            onClick={() => setFilterType(type === filterType ? "all" : type)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                                filterType === type
                                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-3 w-3" />
                            {config.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Severity & read filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {["all", "high", "medium", "low"].map((sev) => (
                        <button
                            key={sev}
                            onClick={() => setFilterSeverity(sev)}
                            className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                                filterSeverity === sev
                                    ? "bg-secondary text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {sev}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowRead(!showRead)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showRead ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {showRead ? "Hide read" : "Show read"}
                </button>
            </div>

            {/* Signal feed */}
            <div className="space-y-3">
                {filteredSignals.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center rounded-xl border border-border bg-card">
                        <Radio className="h-12 w-12 text-muted-foreground/30" />
                        <h3 className="mt-4 text-lg font-semibold">No signals match</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Try adjusting your filters
                        </p>
                    </div>
                ) : (
                    filteredSignals.map((signal, i) => {
                        const config = SIGNAL_TYPE_CONFIG[signal.type];
                        const Icon = SIGNAL_ICONS[signal.type];
                        return (
                            <motion.div
                                key={signal.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className={cn(
                                    "rounded-xl border bg-card p-5 transition-all",
                                    signal.read ? "border-border" : "border-primary/20 bg-primary/[0.02]"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                        signal.severity === "high" ? "bg-red-500/10" :
                                            signal.severity === "medium" ? "bg-amber-500/10" : "bg-blue-500/10"
                                    )}>
                                        <Icon className={cn("h-5 w-5", config.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link
                                                href={`/companies/${signal.company_id}`}
                                                className="text-sm font-bold hover:text-primary transition-colors"
                                            >
                                                {signal.company_name}
                                            </Link>
                                            <span className={cn(
                                                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                                signal.severity === "high" ? "bg-red-500/10 text-red-400" :
                                                    signal.severity === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                                            )}>
                                                {signal.severity}
                                            </span>
                                            <span className={cn(
                                                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                "bg-secondary text-muted-foreground"
                                            )}>
                                                {config.label}
                                            </span>
                                            {!signal.read && (
                                                <span className="signal-dot bg-primary" />
                                            )}
                                        </div>
                                        <h3 className="mt-1.5 text-sm font-medium">{signal.title}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                            {signal.description}
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                {timeAgo(signal.created_at)}
                                            </span>
                                            {!signal.read && (
                                                <button
                                                    onClick={() => {
                                                        markRead(signal.id);
                                                    }}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
