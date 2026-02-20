"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, use } from "react";
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
    Tag,
    Clock,
    Copy,
    CheckCircle2,
    Loader2,
    Zap,
    TrendingUp,
    FileText,
    X,
    Send,
    Trash2,
    Building2,
} from "lucide-react";
import { useCompanyStore, useListStore, useEnrichmentStore } from "@/lib/stores";
import { cn, formatCurrency, STAGE_COLORS, timeAgo } from "@/lib/utils";
import type { EnrichmentResult } from "@/types";
import { toast } from "sonner";

type Tab = "overview" | "signals" | "intelligence" | "notes" | "similar";

export default function CompanyProfilePage() {
    const params = useParams();
    const router = useRouter();
    const companyId = params.id as string;
    const { companies, getCompany, addEnrichment, addNote, deleteNote } = useCompanyStore();
    const { lists, createList, addToList } = useListStore();
    const { useCredit, credits } = useEnrichmentStore();

    const company = getCompany(companyId);
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [enriching, setEnriching] = useState(false);
    const [enrichStep, setEnrichStep] = useState(0);
    const [noteInput, setNoteInput] = useState("");
    const [showListPicker, setShowListPicker] = useState(false);

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
    const enrichSteps = ["Discovering", "Scraping", "Analyzing", "Synthesizing"];

    const handleEnrich = async () => {
        if (!useCredit()) {
            toast.error("No enrichment credits remaining. Credits reset daily.");
            return;
        }

        setEnriching(true);
        setActiveTab("intelligence");

        try {
            const res = await fetch("/api/enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyId: company.id, companyName: company.name, website: company.website }),
            });

            // Simulate progress steps
            for (let i = 0; i < 4; i++) {
                setEnrichStep(i);
                await new Promise((r) => setTimeout(r, 800));
            }

            const data = await res.json();
            if (data.result) {
                addEnrichment(company.id, data.result);
                toast.success("Enrichment complete!");
            }
        } catch {
            // fallback to mock enrichment
            const mockResult: EnrichmentResult = {
                id: `enrich-${Date.now()}`,
                company_id: company.id,
                timestamp: new Date().toISOString(),
                summary: `${company.name} is a ${company.funding_stage} ${company.sector} company based in ${company.location}. They have raised ${formatCurrency(company.raised_amount)} and are building innovative solutions in their domain.`,
                what_they_do: [
                    `Building ${company.sector.toLowerCase()} solutions for enterprise customers`,
                    `Specializing in ${company.tags.slice(0, 2).join(" and ")}`,
                    `Team of ${company.employee_count} employees and growing`,
                    `Founded in ${company.founded_year} with strong market traction`,
                    `Operating in the ${company.location} tech ecosystem`,
                ],
                keywords: company.tags,
                has_careers_page: company.employee_count > 30,
                recent_blog_posts: Math.floor(Math.random() * 8),
                changelog_detected: Math.random() > 0.5,
                tech_stack: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"].slice(0, 3 + Math.floor(Math.random() * 3)),
                hiring_velocity: company.employee_count > 100 ? "high" : company.employee_count > 30 ? "medium" : "low",
                sources: [
                    { url: company.website, title: "Homepage", status: "scraped", scraped_at: new Date().toISOString() },
                    { url: `${company.website}/about`, title: "About", status: "scraped", scraped_at: new Date().toISOString() },
                    { url: `${company.website}/careers`, title: "Careers", status: company.employee_count > 30 ? "scraped" : "skipped" },
                    { url: `${company.website}/blog`, title: "Blog", status: Math.random() > 0.3 ? "scraped" : "failed" },
                ],
                raw_signals: [
                    { type: "careers_page", label: "Careers Page", value: company.employee_count > 30, confidence: 0.95 },
                    { type: "blog_active", label: "Active Blog", value: true, confidence: 0.8 },
                    { type: "hiring_spike", label: "Hiring Velocity", value: company.employee_count > 100 ? "high" : "medium", confidence: 0.7 },
                ],
            };

            for (let i = 0; i < 4; i++) {
                setEnrichStep(i);
                await new Promise((r) => setTimeout(r, 600));
            }

            addEnrichment(company.id, mockResult);
            toast.success("Enrichment complete!");
        } finally {
            setEnriching(false);
            setEnrichStep(0);
        }
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

    const similarCompanies = companies
        .filter(
            (c) =>
                c.id !== company.id &&
                (c.sector === company.sector ||
                    c.tags.some((t) => company.tags.includes(t)))
        )
        .slice(0, 6);

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "overview", label: "Overview", icon: Globe },
        { id: "signals", label: "Signals", icon: Zap },
        { id: "intelligence", label: "Intelligence", icon: Sparkles },
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
                            style={{
                                background: `linear-gradient(135deg, ${company.logo_gradient[0]}, ${company.logo_gradient[1]})`,
                            }}
                        >
                            {company.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                                        stageColors.bg,
                                        stageColors.text
                                    )}
                                >
                                    <span className={cn("h-1.5 w-1.5 rounded-full", stageColors.dot)} />
                                    {company.funding_stage}
                                </span>
                                <span className="mono text-sm font-semibold">
                                    {formatCurrency(company.raised_amount)} raised
                                </span>
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {company.location}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                {company.description}
                            </p>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleEnrich}
                            disabled={enriching}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {enriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Enrich
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowListPicker(!showListPicker)}
                                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
                            >
                                <ListPlus className="h-4 w-4" />
                                Save to List
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
                        {
                            icon: Sparkles,
                            label: "Last Enriched",
                            value: company.last_enriched ? timeAgo(company.last_enriched) : "Never",
                        },
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
                                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">
                                    {company.notes.length}
                                </span>
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
                    {/* OVERVIEW TAB */}
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
                                        <span
                                            key={tag}
                                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    Website Preview
                                </h3>
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

                    {/* SIGNALS TIMELINE TAB */}
                    {activeTab === "signals" && (
                        <div className="space-y-4">
                            {company.enrichment_history.length === 0 ? (
                                <div className="flex flex-col items-center py-16 text-center">
                                    <Zap className="h-10 w-10 text-muted-foreground/30" />
                                    <h3 className="mt-3 font-semibold">No signals yet</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Enrich this company to generate signals</p>
                                    <button onClick={handleEnrich} disabled={enriching} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
                                        Enrich Now
                                    </button>
                                </div>
                            ) : (
                                <div className="relative pl-6 border-l-2 border-border space-y-6">
                                    {company.enrichment_history.map((result, i) => (
                                        <div key={result.id} className="relative">
                                            <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                                            <div className="rounded-xl border border-border bg-card p-5">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(result.timestamp).toLocaleString()}
                                                </div>
                                                <p className="mt-2 text-sm">{result.summary}</p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {result.keywords.map((kw) => (
                                                        <span key={kw} className="rounded-md bg-secondary px-2 py-0.5 text-[10px]">{kw}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* INTELLIGENCE TAB */}
                    {activeTab === "intelligence" && (
                        <div className="space-y-6">
                            {/* Enrichment progress */}
                            {enriching && (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        Enriching {company.name}…
                                    </h3>
                                    <div className="mt-4 space-y-3">
                                        {enrichSteps.map((step, i) => (
                                            <div key={step} className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                                        i < enrichStep
                                                            ? "bg-emerald-500 text-white"
                                                            : i === enrichStep
                                                                ? "bg-primary text-white animate-pulse"
                                                                : "bg-secondary text-muted-foreground"
                                                    )}
                                                >
                                                    {i < enrichStep ? "✓" : i + 1}
                                                </div>
                                                <span className={cn("text-sm", i <= enrichStep ? "text-foreground" : "text-muted-foreground")}>
                                                    {step}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Results */}
                            {company.enrichment_data ? (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                            Executive Summary
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed">{company.enrichment_data.summary}</p>
                                    </div>

                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                            What They Do
                                        </h3>
                                        <ul className="mt-3 space-y-2">
                                            {company.enrichment_data.what_they_do.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Keywords</h3>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {company.enrichment_data.keywords.map((kw) => (
                                                    <span key={kw} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tech Stack</h3>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {company.enrichment_data.tech_stack.map((tech) => (
                                                    <span key={tech} className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mono">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                            Derived Signals
                                        </h3>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            {[
                                                { label: "Careers Page", value: company.enrichment_data.has_careers_page ? "Detected" : "Not found", positive: company.enrichment_data.has_careers_page },
                                                { label: "Blog Posts", value: `${company.enrichment_data.recent_blog_posts} recent`, positive: company.enrichment_data.recent_blog_posts > 0 },
                                                { label: "Changelog", value: company.enrichment_data.changelog_detected ? "Active" : "Not found", positive: company.enrichment_data.changelog_detected },
                                                { label: "Hiring Velocity", value: company.enrichment_data.hiring_velocity, positive: company.enrichment_data.hiring_velocity !== "low" },
                                            ].map((s) => (
                                                <div key={s.label} className="rounded-lg bg-secondary/50 p-3">
                                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                                    <p className={cn("mt-1 text-sm font-semibold", s.positive ? "text-emerald-400" : "text-muted-foreground")}>
                                                        {String(s.value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-border bg-card p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sources</h3>
                                        <div className="mt-3 space-y-2">
                                            {company.enrichment_data.sources.map((src) => (
                                                <div key={src.url} className="flex items-center gap-3 rounded-lg bg-secondary/30 px-4 py-2.5">
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        src.status === "scraped" ? "bg-emerald-400" : src.status === "failed" ? "bg-red-400" : "bg-amber-400"
                                                    )} />
                                                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors truncate flex-1">
                                                        {src.title} — {src.url}
                                                    </a>
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{src.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : !enriching ? (
                                <div className="flex flex-col items-center py-16 text-center">
                                    <Sparkles className="h-10 w-10 text-muted-foreground/30" />
                                    <h3 className="mt-3 font-semibold">No enrichment data</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Click "Enrich" to gather intelligence about {company.name}
                                    </p>
                                    <button onClick={handleEnrich} className="mt-4 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2.5 text-sm font-medium text-white">
                                        Enrich Now
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* NOTES TAB */}
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
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Add your first note above
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {company.notes.map((note) => (
                                        <div key={note.id} className="rounded-xl border border-border bg-card p-4 group">
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm leading-relaxed">{note.content}</p>
                                                <button
                                                    onClick={() => {
                                                        deleteNote(company.id, note.id);
                                                        toast.success("Note deleted");
                                                    }}
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

                    {/* SIMILAR TAB */}
                    {activeTab === "similar" && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {similarCompanies.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/companies/${c.id}`}
                                    className="rounded-xl border border-border bg-card p-5 card-hover"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                                            style={{
                                                background: `linear-gradient(135deg, ${c.logo_gradient[0]}, ${c.logo_gradient[1]})`,
                                            }}
                                        >
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{c.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={cn("text-xs font-medium", STAGE_COLORS[c.funding_stage].text)}>
                                                    {c.funding_stage}
                                                </span>
                                                <span className="text-xs text-muted-foreground mono">
                                                    {formatCurrency(c.raised_amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                                        {c.description}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {c.tags
                                            .filter((t) => company.tags.includes(t))
                                            .map((t) => (
                                                <span key={t} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                                                    {t}
                                                </span>
                                            ))}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
