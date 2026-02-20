"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    ExternalLink,
    Sparkles,
    ListPlus,
    StickyNote,
    Globe,
    MapPin,
    Users,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle2,
    Loader2,
    Zap,
    TrendingUp,
    FileText,
    Send,
    Trash2,
    Building2,
    Brain,
    MessageSquare,
    AlertTriangle,
    Target,
    Shield,
    X,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useCompanyStore, useListStore, useEnrichmentStore, useSettingsStore, useAIResultsStore } from "@/lib/stores";
import { cn, formatCurrency, STAGE_COLORS, timeAgo } from "@/lib/utils";
import { useGeminiEnrichment, useInvestmentMemo, useCompanyChat } from "@/hooks/useGemini";
import type { GeminiEnrichmentData, GeminiMemoData } from "@/lib/gemini/schemas";
import { toast } from "sonner";
import { ApiKeyModal } from "@/components/settings/api-key-modal";

type Tab = "overview" | "intelligence" | "memo" | "chat" | "notes" | "similar";

export default function CompanyProfilePage() {
    const params = useParams();
    const router = useRouter();
    const companyId = params.id as string;
    const { companies, getCompany, addNote, deleteNote } = useCompanyStore();
    const { lists, createList, addToList } = useListStore();
    const { useCredit } = useEnrichmentStore();
    const hasApiKey = useSettingsStore((s) => s.hasApiKey());
    const { setEnrichment, setMemo, getEnrichment, getMemo, setChatHistory, getChatHistory } = useAIResultsStore();

    const company = getCompany(companyId);
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [showListPicker, setShowListPicker] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Gemini hooks
    const { enrichCompany, isEnriching, progress: enrichProgress } = useGeminiEnrichment();
    const { generateMemo, isGenerating: isMemoGenerating, progress: memoProgress } = useInvestmentMemo();
    const { messages, sendMessage, clearChat, isLoading: isChatLoading, setMessages } = useCompanyChat();

    // Gemini state — initialized from cache
    const [geminiData, setGeminiData] = useState<GeminiEnrichmentData | null>(null);
    const [memoData, setMemoData] = useState<GeminiMemoData | null>(null);
    const [chatInput, setChatInput] = useState("");
    const [noteInput, setNoteInput] = useState("");

    // Load cached AI data on mount
    useEffect(() => {
        const cachedEnrichment = getEnrichment(companyId);
        if (cachedEnrichment) setGeminiData(cachedEnrichment as unknown as GeminiEnrichmentData);
        const cachedMemo = getMemo(companyId);
        if (cachedMemo) setMemoData(cachedMemo as unknown as GeminiMemoData);
        const cachedChat = getChatHistory(companyId);
        if (cachedChat.length > 0) setMessages(cachedChat);
    }, [companyId]);

    // Persist chat messages to store when they change
    useEffect(() => {
        if (messages.length > 0) {
            setChatHistory(companyId, messages);
        }
    }, [messages, companyId, setChatHistory]);

    // Memo section expansion
    const [expandedMemoSections, setExpandedMemoSections] = useState<Set<string>>(
        new Set(["thesis", "recommendation"])
    );

    if (!mounted) {
        return null;
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Building2 className="h-12 w-12 text-muted-foreground/30" />
                <h2 className="mt-4 text-lg font-semibold">Company not found</h2>
                <button
                    onClick={() => router.push("/companies")}
                    className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                    Back to Companies
                </button>
            </div>
        );
    }

    const stageColors = STAGE_COLORS[company.funding_stage];

    const handleGeminiEnrich = async () => {
        if (!hasApiKey) {
            setShowApiKeyModal(true);
            return;
        }
        if (!useCredit()) {
            toast.error("No enrichment credits remaining. Credits reset daily.");
            return;
        }
        setActiveTab("intelligence");
        const result = await enrichCompany(company.name, company.website, company.description);
        if (result) {
            setGeminiData(result);
            setEnrichment(companyId, result as unknown as Record<string, unknown>);
            toast.success("Gemini AI analysis complete!");
        } else {
            toast.error("Enrichment failed — check your API key in Settings");
        }
    };

    const handleGenerateMemo = async () => {
        if (!hasApiKey) {
            setShowApiKeyModal(true);
            return;
        }
        setActiveTab("memo");
        const companyPayload = {
            name: company.name,
            website: company.website,
            funding_stage: company.funding_stage,
            raised_amount: company.raised_amount,
            location: company.location,
            description: company.description,
            founded_year: company.founded_year,
            employee_count: company.employee_count,
            sector: company.sector,
            tags: company.tags,
        };
        const result = await generateMemo(companyPayload, geminiData);
        if (result) {
            setMemoData(result);
            setMemo(companyId, result as unknown as Record<string, unknown>);
            toast.success("Investment memo generated!");
        } else {
            toast.error("Memo generation failed");
        }
    };

    const handleSendChat = async () => {
        if (!chatInput.trim()) return;
        if (!hasApiKey) {
            setShowApiKeyModal(true);
            return;
        }
        const msg = chatInput;
        setChatInput("");
        await sendMessage(msg, {
            name: company.name,
            website: company.website,
            funding_stage: company.funding_stage,
            raised_amount: company.raised_amount,
            location: company.location,
            description: company.description,
            sector: company.sector,
            tags: company.tags,
            enrichment: geminiData,
        });
    };

    const handleAddNote = () => {
        if (!noteInput.trim()) return;
        addNote(company.id, noteInput.trim());
        setNoteInput("");
        toast.success("Note added");
    };

    const handleAddToList = (listId: string) => {
        addToList(listId, [company.id]);
        setShowListPicker(false);
        toast.success("Added to list");
    };

    const toggleMemoSection = (section: string) => {
        setExpandedMemoSections((prev) => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    const similarCompanies = companies
        .filter(
            (c) => c.id !== company.id && (c.sector === company.sector || c.tags.some((t) => company.tags.includes(t)))
        )
        .slice(0, 6);

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "overview", label: "Overview", icon: Globe },
        { id: "intelligence", label: "AI Intelligence", icon: Sparkles },
        { id: "memo", label: "Investment Memo", icon: FileText },
        { id: "chat", label: "Ask AI", icon: MessageSquare },
        { id: "notes", label: "Notes", icon: StickyNote },
        { id: "similar", label: "Similar", icon: Building2 },
    ];

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={() => router.push("/companies")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Companies
            </button>

            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-6 lg:p-8"
            >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-5">
                        <div
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${company.logo_gradient[0]}, ${company.logo_gradient[1]})` }}
                        >
                            {company.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", stageColors.bg, stageColors.text)}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full", stageColors.dot)} />
                                    {company.funding_stage}
                                </span>
                                <span className="mono text-sm font-semibold">{formatCurrency(company.raised_amount)} raised</span>
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {company.location}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{company.description}</p>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleGeminiEnrich}
                            disabled={isEnriching}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isEnriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                            AI Enrich
                        </button>
                        <button
                            onClick={handleGenerateMemo}
                            disabled={isMemoGenerating}
                            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                        >
                            {isMemoGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                            Generate Memo
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowListPicker(!showListPicker)}
                                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
                            >
                                <ListPlus className="h-4 w-4" />
                                Save
                            </button>
                            <AnimatePresence>
                                {showListPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-border bg-card p-2 shadow-xl"
                                    >
                                        {lists.length === 0 ? (
                                            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                                <p>No lists yet</p>
                                                <button
                                                    onClick={() => {
                                                        const list = createList("My List");
                                                        addToList(list.id, [company.id]);
                                                        setShowListPicker(false);
                                                        toast.success("Created list & added company");
                                                    }}
                                                    className="mt-2 text-primary hover:underline"
                                                >
                                                    Create first list
                                                </button>
                                            </div>
                                        ) : (
                                            lists.map((list) => (
                                                <button
                                                    key={list.id}
                                                    onClick={() => handleAddToList(list.id)}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition-colors"
                                                >
                                                    <ListPlus className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {list.name}
                                                    {list.company_ids.includes(company.id) && (
                                                        <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-400" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Website
                        </a>
                    </div>
                </div>

                {/* Meta grid */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { icon: Calendar, label: "Founded", value: company.founded_year.toString() },
                        { icon: Users, label: "Employees", value: company.employee_count.toString() },
                        { icon: DollarSign, label: "Total Raised", value: formatCurrency(company.raised_amount) },
                        { icon: Sparkles, label: "Last Enriched", value: company.last_enriched ? timeAgo(company.last_enriched) : "Never" },
                    ].map((m) => (
                        <div key={m.label} className="rounded-lg bg-secondary/50 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <m.icon className="h-3 w-3" />
                                {m.label}
                            </div>
                            <p className="mt-1 text-sm font-semibold">{m.value}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="border-b border-border">
                <div className="flex gap-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.id === "notes" && company.notes.length > 0 && (
                                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{company.notes.length}</span>
                            )}
                            {tab.id === "intelligence" && geminiData && (
                                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">✓</span>
                            )}
                            {tab.id === "memo" && memoData && (
                                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* ======================== OVERVIEW ======================== */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
                                <p className="mt-3 text-sm leading-relaxed">{company.description}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tags</h3>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {company.tags.map((tag) => (
                                        <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Website</h3>
                                <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 flex items-center gap-3 rounded-lg bg-secondary/50 p-4 hover:bg-secondary transition-colors group"
                                >
                                    <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div>
                                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                            {company.website.replace("https://", "")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Visit website →</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* ======================== AI INTELLIGENCE ======================== */}
                    {activeTab === "intelligence" && (
                        <div className="space-y-6">
                            {/* Progress indicator */}
                            {isEnriching && (
                                <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-slate-900/50 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                                        <div>
                                            <p className="text-sm font-medium text-indigo-300">Gemini AI Analyzing…</p>
                                            <p className="text-xs text-muted-foreground">{enrichProgress}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Enrichment results */}
                            {geminiData ? (
                                <div className="space-y-4">
                                    {/* Executive summary */}
                                    <div className="rounded-xl border border-indigo-500/20 bg-card p-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <Brain className="h-4 w-4 text-indigo-400" />
                                                AI Executive Summary
                                            </h3>
                                            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                                                {geminiData.confidence_score}% confidence
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm leading-relaxed">{geminiData.executive_summary}</p>
                                    </div>

                                    {/* Key metrics row */}
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {[
                                            {
                                                label: "Competitive Moat",
                                                value: geminiData.competitive_moat,
                                                icon: Shield,
                                                color: geminiData.competitive_moat === "High" ? "text-emerald-400" : geminiData.competitive_moat === "Medium" ? "text-amber-400" : "text-red-400",
                                            },
                                            {
                                                label: "Team Quality",
                                                value: geminiData.team_quality,
                                                icon: Users,
                                                color: geminiData.team_quality === "Exceptional" ? "text-emerald-400" : geminiData.team_quality === "Strong" ? "text-blue-400" : "text-muted-foreground",
                                            },
                                            {
                                                label: "Business Model",
                                                value: geminiData.business_model,
                                                icon: Target,
                                                color: "text-violet-400",
                                            },
                                            {
                                                label: "Funding Readiness",
                                                value: geminiData.funding_readiness,
                                                icon: DollarSign,
                                                color: "text-amber-400",
                                            },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <item.icon className="h-3.5 w-3.5" />
                                                    {item.label}
                                                </div>
                                                <p className={cn("mt-1.5 text-sm font-semibold", item.color)}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* What they do */}
                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">What They Do</h3>
                                        <ul className="mt-3 space-y-2">
                                            {geminiData.what_they_do.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Target Market */}
                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Target Market</h3>
                                        <p className="mt-3 text-sm leading-relaxed">{geminiData.target_market}</p>
                                    </div>

                                    {/* Growth signals & risks side by side */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                                Growth Signals
                                            </h3>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {geminiData.growth_signals.map((signal, i) => (
                                                    <span key={i} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                                                        {signal}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                                Risk Factors
                                            </h3>
                                            <ul className="mt-3 space-y-2">
                                                {geminiData.risk_factors.map((risk, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-red-300/80">
                                                        <span className="mt-0.5 text-red-500">•</span>
                                                        {risk}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Tech stack & keywords */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tech Stack</h3>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {geminiData.tech_stack.map((tech) => (
                                                    <span key={tech} className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mono">{tech}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Keywords</h3>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {geminiData.keywords.map((kw) => (
                                                    <span key={kw} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommended actions */}
                                    <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                                            <Zap className="h-3.5 w-3.5" />
                                            Recommended Next Steps
                                        </h3>
                                        <ul className="mt-3 space-y-2">
                                            {geminiData.recommended_actions.map((action, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                        {i + 1}
                                                    </span>
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : !isEnriching ? (
                                <div className="flex flex-col items-center py-16 text-center">
                                    <div className="relative">
                                        <Brain className="h-12 w-12 text-muted-foreground/30" />
                                        <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-indigo-400" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">AI-Powered Intelligence</h3>
                                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                        Enrich {company.name} with Gemini 2.5 Flash for structured investment analysis including competitive moat, growth signals, risk factors, and recommended actions.
                                    </p>
                                    <button
                                        onClick={handleGeminiEnrich}
                                        className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                                    >
                                        <Brain className="h-4 w-4" />
                                        Analyze with Gemini AI
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* ======================== INVESTMENT MEMO ======================== */}
                    {activeTab === "memo" && (
                        <div className="space-y-4">
                            {isMemoGenerating && (
                                <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 to-slate-900/50 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                                        <div>
                                            <p className="text-sm font-medium text-violet-300">Generating Investment Memo…</p>
                                            <p className="text-xs text-muted-foreground">{memoProgress}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {memoData ? (
                                <div className="space-y-3">
                                    {/* Recommendation banner */}
                                    <div className={cn(
                                        "rounded-xl border p-5",
                                        memoData.recommendation.decision === "Invest"
                                            ? "border-emerald-500/20 bg-emerald-500/5"
                                            : memoData.recommendation.decision === "Pass"
                                                ? "border-red-500/20 bg-red-500/5"
                                                : "border-amber-500/20 bg-amber-500/5"
                                    )}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">IC Recommendation</p>
                                                <p className={cn(
                                                    "mt-1 text-2xl font-bold",
                                                    memoData.recommendation.decision === "Invest" ? "text-emerald-400"
                                                        : memoData.recommendation.decision === "Pass" ? "text-red-400"
                                                            : "text-amber-400"
                                                )}>
                                                    {memoData.recommendation.decision}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Conviction</p>
                                                <p className="text-3xl font-bold mono">{memoData.recommendation.conviction}<span className="text-lg text-muted-foreground">/10</span></p>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm leading-relaxed">{memoData.recommendation.rationale}</p>
                                    </div>

                                    {/* Collapsible sections */}
                                    {[
                                        {
                                            key: "thesis", label: "Investment Thesis", icon: Target, content: (
                                                <p className="text-sm leading-relaxed">{memoData.investment_thesis}</p>
                                            )
                                        },
                                        {
                                            key: "market", label: "Market Opportunity", icon: TrendingUp, content: (
                                                <div className="space-y-3">
                                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                        {[
                                                            { label: "TAM", value: memoData.market_opportunity.tam },
                                                            { label: "SAM", value: memoData.market_opportunity.sam },
                                                            { label: "SOM", value: memoData.market_opportunity.som },
                                                            { label: "Growth", value: memoData.market_opportunity.growth_rate },
                                                        ].map((m) => (
                                                            <div key={m.label} className="rounded-lg bg-secondary/50 px-3 py-2">
                                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                                                                <p className="mt-0.5 text-xs font-medium">{m.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted-foreground">Key Trends</p>
                                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                                            {memoData.market_opportunity.key_trends.map((t, i) => (
                                                                <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary">{t}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: "product", label: "Product Analysis", icon: Zap, content: (
                                                <div className="space-y-3">
                                                    <p className="text-sm">{memoData.product_analysis.description}</p>
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted-foreground">Key Features</p>
                                                        <ul className="mt-1 space-y-1">
                                                            {memoData.product_analysis.key_features.map((f, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-xs"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />{f}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted-foreground">Differentiation</p>
                                                        <p className="mt-0.5 text-xs">{memoData.product_analysis.differentiation}</p>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: "competition", label: "Competitive Landscape", icon: Shield, content: (
                                                <div className="space-y-2">
                                                    {memoData.competitive_landscape.map((comp, i) => (
                                                        <div key={i} className="rounded-lg border border-border bg-secondary/30 p-3">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-semibold">{comp.competitor}</p>
                                                                <span className={cn(
                                                                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                                                    comp.threat_level === "High" ? "bg-red-500/10 text-red-400"
                                                                        : comp.threat_level === "Medium" ? "bg-amber-500/10 text-amber-400"
                                                                            : "bg-blue-500/10 text-blue-400"
                                                                )}>
                                                                    {comp.threat_level} threat
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                                                <div>
                                                                    <p className="text-[10px] font-semibold text-emerald-400">Strength</p>
                                                                    <p className="text-xs">{comp.strength}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-semibold text-red-400">Weakness</p>
                                                                    <p className="text-xs">{comp.weakness}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        },
                                        {
                                            key: "risks", label: "Risk Assessment", icon: AlertTriangle, content: (
                                                <div className="space-y-2">
                                                    {memoData.risk_assessment.map((risk, i) => (
                                                        <div key={i} className="rounded-lg border border-border bg-secondary/30 p-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn(
                                                                    "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                                                    risk.severity === "High" ? "bg-red-500/10 text-red-400"
                                                                        : risk.severity === "Medium" ? "bg-amber-500/10 text-amber-400"
                                                                            : "bg-blue-500/10 text-blue-400"
                                                                )}>
                                                                    {risk.severity}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground uppercase">{risk.category}</span>
                                                            </div>
                                                            <p className="mt-1.5 text-xs">{risk.description}</p>
                                                            <p className="mt-1 text-xs text-emerald-400/70"><span className="font-semibold">Mitigation:</span> {risk.mitigation}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        },
                                        {
                                            key: "nextSteps", label: "Next Steps", icon: Zap, content: (
                                                <div className="space-y-2">
                                                    {memoData.recommendation.next_steps.map((step, i) => (
                                                        <div key={i} className="flex items-start gap-3 text-sm">
                                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                                                            {step}
                                                        </div>
                                                    ))}
                                                    {memoData.recommendation.suggested_terms && (
                                                        <div className="mt-2 rounded-lg bg-secondary/50 p-3">
                                                            <p className="text-xs text-muted-foreground">Suggested Terms</p>
                                                            <p className="mt-0.5 text-xs font-medium">{memoData.recommendation.suggested_terms}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        },
                                    ].map((section) => (
                                        <div key={section.key} className="rounded-xl border border-border bg-card overflow-hidden">
                                            <button
                                                onClick={() => toggleMemoSection(section.key)}
                                                className="flex w-full items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
                                            >
                                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                                    <section.icon className="h-4 w-4 text-primary" />
                                                    {section.label}
                                                </h3>
                                                {expandedMemoSections.has(section.key) ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </button>
                                            <AnimatePresence>
                                                {expandedMemoSections.has(section.key) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-5 pb-5">{section.content}</div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            ) : !isMemoGenerating ? (
                                <div className="flex flex-col items-center py-16 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground/30" />
                                    <h3 className="mt-4 text-lg font-semibold">Investment Memo</h3>
                                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                        Generate a comprehensive IC-quality investment memo using Gemini Pro with deep reasoning. Includes market analysis, competitive landscape, risk assessment, and recommendation.
                                    </p>
                                    <button
                                        onClick={handleGenerateMemo}
                                        className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Generate Investment Memo
                                    </button>
                                    {geminiData && (
                                        <p className="mt-2 text-xs text-emerald-400">✓ AI enrichment data will enhance the memo</p>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* ======================== CHAT ======================== */}
                    {activeTab === "chat" && (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-border bg-card overflow-hidden">
                                {/* Chat header */}
                                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold">Ask Signal AI about {company.name}</h3>
                                    </div>
                                    {messages.length > 0 && (
                                        <button onClick={clearChat} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            Clear chat
                                        </button>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                                            <p className="mt-3 text-sm text-muted-foreground">
                                                Ask anything about {company.name}
                                            </p>
                                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                                {[
                                                    "What are the key risks?",
                                                    "Summarize their competitive advantage",
                                                    "Is this a good investment?",
                                                    "What questions should I ask the founders?",
                                                ].map((q) => (
                                                    <button
                                                        key={q}
                                                        onClick={() => setChatInput(q)}
                                                        className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex gap-3",
                                                msg.role === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[80%] rounded-xl px-4 py-3 text-sm",
                                                    msg.role === "user"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary border border-border"
                                                )}
                                            >
                                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                                <p className="mt-1 text-[10px] opacity-50">{timeAgo(msg.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isChatLoading && (
                                        <div className="flex gap-3">
                                            <div className="rounded-xl bg-secondary border border-border px-4 py-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Thinking…
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <div className="border-t border-border px-4 py-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                                            placeholder={`Ask about ${company.name}…`}
                                            className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            disabled={isChatLoading}
                                        />
                                        <button
                                            onClick={handleSendChat}
                                            disabled={!chatInput.trim() || isChatLoading}
                                            className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================== NOTES ======================== */}
                    {activeTab === "notes" && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                                    placeholder="Add a note about this company..."
                                    className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!noteInput.trim()}
                                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>

                            {company.notes.length === 0 ? (
                                <div className="flex flex-col items-center py-16 text-center">
                                    <StickyNote className="h-10 w-10 text-muted-foreground/30" />
                                    <h3 className="mt-3 font-semibold">No notes yet</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Add your first note above</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {company.notes.map((note) => (
                                        <div key={note.id} className="rounded-xl border border-border bg-card p-4 group">
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm leading-relaxed">{note.content}</p>
                                                <button
                                                    onClick={() => { deleteNote(company.id, note.id); toast.success("Note deleted"); }}
                                                    className="ml-2 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <p className="mt-2 text-xs text-muted-foreground">{timeAgo(note.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======================== SIMILAR ======================== */}
                    {activeTab === "similar" && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {similarCompanies.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center py-16 text-center">
                                    <Building2 className="h-10 w-10 text-muted-foreground/30" />
                                    <h3 className="mt-3 font-semibold">No similar companies found</h3>
                                </div>
                            ) : (
                                similarCompanies.map((c) => (
                                    <Link key={c.id} href={`/companies/${c.id}`} className="rounded-xl border border-border bg-card p-5 card-hover">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                                                style={{ background: `linear-gradient(135deg, ${c.logo_gradient[0]}, ${c.logo_gradient[1]})` }}
                                            >
                                                {c.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{c.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={cn("text-xs font-medium", STAGE_COLORS[c.funding_stage].text)}>{c.funding_stage}</span>
                                                    <span className="text-xs text-muted-foreground mono">{formatCurrency(c.raised_amount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {c.tags.filter((t) => company.tags.includes(t)).map((t) => (
                                                <span key={t} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{t}</span>
                                            ))}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <ApiKeyModal open={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
        </div>
    );
}
