import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FundingStage, SignalType } from "@/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}B`;
    if (amount >= 1) return `$${amount.toFixed(0)}M`;
    return `$${(amount * 1000).toFixed(0)}K`;
}

export function formatNumber(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
}

export function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const STAGE_COLORS: Record<FundingStage, { bg: string; text: string; dot: string }> = {
    "Pre-Seed": { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    Seed: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
    "Series A": { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
    "Series B": { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-400" },
    "Series C": { bg: "bg-pink-500/10", text: "text-pink-400", dot: "bg-pink-400" },
    "Series D": { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
};

export const SIGNAL_TYPE_CONFIG: Record<
    SignalType,
    { label: string; icon: string; color: string }
> = {
    hiring_spike: { label: "Hiring Spike", icon: "TrendingUp", color: "text-emerald-400" },
    new_funding: { label: "New Funding", icon: "DollarSign", color: "text-blue-400" },
    leadership_change: { label: "Leadership Change", icon: "Users", color: "text-violet-400" },
    tech_stack_update: { label: "Tech Stack Update", icon: "Code", color: "text-cyan-400" },
    careers_page: { label: "Careers Page", icon: "Briefcase", color: "text-amber-400" },
    blog_active: { label: "Blog Active", icon: "FileText", color: "text-pink-400" },
    changelog_present: { label: "Changelog Detected", icon: "GitBranch", color: "text-orange-400" },
    growth_signal: { label: "Growth Signal", icon: "Zap", color: "text-yellow-400" },
};

export const LOCATIONS = [
    "San Francisco, CA",
    "New York, NY",
    "London, UK",
    "Berlin, Germany",
    "Toronto, Canada",
    "Austin, TX",
    "Seattle, WA",
    "Boston, MA",
    "Tel Aviv, Israel",
    "Singapore",
    "Los Angeles, CA",
    "Chicago, IL",
    "Denver, CO",
    "Miami, FL",
    "Paris, France",
];

export const ALL_TAGS = [
    "machine-learning", "nlp", "computer-vision", "generative-ai", "llm",
    "payments", "lending", "banking", "crypto", "defi",
    "carbon-capture", "sustainability", "clean-energy", "ev",
    "biotech", "telemedicine", "diagnostics", "genomics",
    "b2b-saas", "developer-tools", "api-first", "cloud-native",
    "cybersecurity", "zero-trust", "identity", "compliance",
    "edtech", "e-learning", "workforce", "upskilling",
    "logistics", "supply-chain", "robotics", "autonomous",
    "marketplace", "data-infrastructure", "analytics", "open-source",
];
