"use client";

import { motion } from "framer-motion";
import {
    Building2,
    Sparkles,
    List,
    TrendingUp,
    Zap,
    ArrowRight,
    Radio,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { useCompanyStore, useSignalStore, useEnrichmentStore, useListStore } from "@/lib/stores";
import { formatCurrency, timeAgo, STAGE_COLORS, SIGNAL_TYPE_CONFIG } from "@/lib/utils";
import type { Signal } from "@/types";

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

function StatCard({
    label,
    value,
    icon: Icon,
    gradient,
    href,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    gradient: string;
    href: string;
}) {
    return (
        <Link href={href}>
            <motion.div
                variants={item}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 card-hover"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
                    </div>
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${gradient}`}
                    >
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    <span>View details</span>
                    <ArrowRight className="ml-1 h-3 w-3" />
                </div>
            </motion.div>
        </Link>
    );
}

function SignalFeedItem({ signal }: { signal: Signal }) {
    const config = SIGNAL_TYPE_CONFIG[signal.type];

    return (
        <motion.div
            variants={item}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 card-hover"
        >
            <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-opacity-10 ${signal.severity === "high"
                    ? "bg-red-500/10"
                    : signal.severity === "medium"
                        ? "bg-amber-500/10"
                        : "bg-blue-500/10"
                    }`}
            >
                <Zap
                    className={`h-4 w-4 ${signal.severity === "high"
                        ? "text-red-400"
                        : signal.severity === "medium"
                            ? "text-amber-400"
                            : "text-blue-400"
                        }`}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Link
                        href={`/companies/${signal.company_id}`}
                        className="text-sm font-semibold hover:text-primary transition-colors"
                    >
                        {signal.company_name}
                    </Link>
                    <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${signal.severity === "high"
                            ? "bg-red-500/10 text-red-400"
                            : signal.severity === "medium"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                    >
                        {signal.severity}
                    </span>
                    {!signal.read && (
                        <span className="signal-dot bg-primary" />
                    )}
                </div>
                <p className="mt-1 text-sm text-foreground">{signal.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(signal.created_at)}</p>
            </div>
        </motion.div>
    );
}

export default function DashboardPage() {
    const { companies } = useCompanyStore();
    const { signals } = useSignalStore();
    const { credits } = useEnrichmentStore();
    const { lists } = useListStore();

    const enrichedCount = companies.filter((c) => c.last_enriched).length;
    const hotCompanies = companies
        .filter((c) => c.raised_amount > 100)
        .sort((a, b) => b.raised_amount - a.raised_amount)
        .slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold tracking-tight"
                >
                    Dashboard
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-1 text-muted-foreground"
                >
                    Your VC intelligence at a glance
                </motion.p>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
                <StatCard
                    label="Companies Tracked"
                    value={companies.length}
                    icon={Building2}
                    gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
                    href="/companies"
                />
                <StatCard
                    label="Lists Created"
                    value={lists.length}
                    icon={List}
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                    href="/lists"
                />
                <StatCard
                    label="Enrichments Used"
                    value={`${credits.used}/${credits.total}`}
                    icon={Sparkles}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                    href="/enrich"
                />
                <StatCard
                    label="Active Signals"
                    value={signals.filter((s) => !s.read).length}
                    icon={Radio}
                    gradient="bg-gradient-to-br from-pink-500 to-rose-600"
                    href="/signals"
                />
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Signal feed */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="lg:col-span-2 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Radio className="h-4 w-4 text-primary" />
                            Signal Feed
                        </h2>
                        <Link
                            href="/signals"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                            View all <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {signals.slice(0, 6).map((signal) => (
                            <SignalFeedItem key={signal.id} signal={signal} />
                        ))}
                    </div>
                </motion.div>

                {/* Hot Signals sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Hot Companies
                    </h2>

                    <div className="space-y-3">
                        {hotCompanies.map((company, i) => (
                            <Link
                                key={company.id}
                                href={`/companies/${company.id}`}
                                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 card-hover"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${company.logo_gradient[0]}, ${company.logo_gradient[1]})`,
                                    }}
                                >
                                    {company.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{company.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-xs ${STAGE_COLORS[company.funding_stage].text}`}>
                                            {company.funding_stage}
                                        </span>
                                        <span className="text-xs text-muted-foreground">·</span>
                                        <span className="text-xs text-muted-foreground mono">
                                            {formatCurrency(company.raised_amount)}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-muted-foreground">
                                    #{i + 1}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Recent enrichments */}
                    <div className="mt-6 space-y-3">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Enrichment Credits
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Used today</span>
                                <span className="mono font-semibold">{credits.used}/{credits.total}</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
                                    style={{ width: `${(credits.used / credits.total) * 100}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Resets daily · {50 - credits.used} remaining
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
