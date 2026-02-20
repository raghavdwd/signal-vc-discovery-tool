"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    Upload,
    FileJson,
    FileSpreadsheet,
    Sparkles,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Play,
    Trash2,
    Zap,
} from "lucide-react";
import { useCompanyStore, useEnrichmentStore } from "@/lib/stores";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";
import type { EnrichmentJob, EnrichmentResult } from "@/types";
import { toast } from "sonner";

const STATUS_CONFIG = {
    pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", label: "Pending" },
    processing: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10", label: "Processing" },
    completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Completed" },
    failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Failed" },
};

export default function EnrichPage() {
    const { companies, addEnrichment } = useCompanyStore();
    const { jobs, addJob, updateJob, credits, useCredit, resetCredits } = useEnrichmentStore();
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [enrichingAll, setEnrichingAll] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleBatchEnrich = async () => {
        if (selectedCompanies.length === 0) {
            toast.error("Select companies to enrich");
            return;
        }

        setEnrichingAll(true);

        for (const companyId of selectedCompanies) {
            const company = companies.find((c) => c.id === companyId);
            if (!company) continue;

            if (!useCredit()) {
                toast.error("No enrichment credits remaining");
                break;
            }

            const job = addJob(company.id, company.name);

            // Simulate enrichment
            updateJob(job.id, { status: "processing", step: "discovering", progress: 25 });
            await new Promise((r) => setTimeout(r, 400));
            updateJob(job.id, { step: "scraping", progress: 50 });
            await new Promise((r) => setTimeout(r, 400));
            updateJob(job.id, { step: "analyzing", progress: 75 });
            await new Promise((r) => setTimeout(r, 400));

            const result: EnrichmentResult = {
                id: `enrich-${Date.now()}-${company.id}`,
                company_id: company.id,
                timestamp: new Date().toISOString(),
                summary: `${company.name} is a ${company.funding_stage} ${company.sector} company based in ${company.location}, building innovative solutions.`,
                what_they_do: [
                    `Core focus on ${company.tags[0] || company.sector.toLowerCase()}`,
                    `Team of ${company.employee_count} employees`,
                    `${formatCurrency(company.raised_amount)} raised to date`,
                    `Founded in ${company.founded_year}`,
                    `Operating from ${company.location}`,
                ],
                keywords: company.tags,
                has_careers_page: company.employee_count > 30,
                recent_blog_posts: Math.floor(Math.random() * 8),
                changelog_detected: Math.random() > 0.5,
                tech_stack: ["React", "Node.js", "TypeScript", "AWS"].slice(0, 2 + Math.floor(Math.random() * 3)),
                hiring_velocity: company.employee_count > 100 ? "high" : "medium",
                sources: [
                    { url: company.website, title: "Homepage", status: "scraped" },
                    { url: `${company.website}/about`, title: "About", status: "scraped" },
                ],
                raw_signals: [],
            };

            updateJob(job.id, { status: "completed", step: "done", progress: 100, result, completed_at: new Date().toISOString() });
            addEnrichment(company.id, result);
        }

        setEnrichingAll(false);
        setSelectedCompanies([]);
        toast.success("Batch enrichment complete!");
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        toast.info("CSV/JSON import would process uploaded company data here");
    };

    const toggleCompany = (id: string) => {
        setSelectedCompanies((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const unenrichedCompanies = companies.filter((c) => !c.last_enriched);

    return (
        <div className="space-y-8">
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold tracking-tight"
                >
                    Batch Enrichment
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-1 text-muted-foreground"
                >
                    Enrich multiple companies at once or import from CSV/JSON
                </motion.p>
            </div>

            {/* Credits bar */}
            <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Enrichment Credits</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {credits.total - credits.used} of {credits.total} remaining · Resets daily
                        </p>
                    </div>
                    <button
                        onClick={resetCredits}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Reset Credits
                    </button>
                </div>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
                        style={{ width: `${(credits.used / credits.total) * 100}%` }}
                    />
                </div>
            </div>

            {/* Upload zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={cn(
                    "rounded-xl border-2 border-dashed p-8 text-center transition-all",
                    dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                )}
            >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                    Drop CSV or JSON files here to import companies
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Supports .csv and .json files with company data
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Upload CSV
                    </button>
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
                    >
                        <FileJson className="h-4 w-4" />
                        Upload JSON
                    </button>
                </div>
                <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" />
            </div>

            {/* Select companies to enrich */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold">Select Companies to Enrich</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedCompanies.length} selected · {unenrichedCompanies.length} unenriched
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedCompanies(unenrichedCompanies.slice(0, 10).map((c) => c.id))}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                        >
                            Select Top 10
                        </button>
                        <button
                            onClick={handleBatchEnrich}
                            disabled={selectedCompanies.length === 0 || enrichingAll}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {enrichingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Enrich Selected
                        </button>
                    </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-border/50">
                    {unenrichedCompanies.map((company) => (
                        <label
                            key={company.id}
                            className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-secondary/30 transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCompanies.includes(company.id)}
                                onChange={() => toggleCompany(company.id)}
                                className="h-4 w-4 rounded border-border accent-primary"
                            />
                            <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                                style={{
                                    background: `linear-gradient(135deg, ${company.logo_gradient[0]}, ${company.logo_gradient[1]})`,
                                }}
                            >
                                {company.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{company.name}</p>
                                <p className="text-xs text-muted-foreground">{company.sector} · {company.funding_stage}</p>
                            </div>
                            <span className="mono text-xs text-muted-foreground">
                                {formatCurrency(company.raised_amount)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Job queue */}
            {jobs.length > 0 && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="border-b border-border px-5 py-4">
                        <h2 className="text-sm font-semibold">Enrichment Queue</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {jobs.slice(0, 20).map((job) => {
                            const config = STATUS_CONFIG[job.status];
                            const Icon = config.icon;
                            return (
                                <div key={job.id} className="flex items-center gap-4 px-5 py-3">
                                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.bg)}>
                                        <Icon className={cn("h-4 w-4", config.color, job.status === "processing" && "animate-spin")} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{job.company_name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{job.step.replace("_", " ")}</p>
                                    </div>
                                    {job.status === "processing" && (
                                        <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-300"
                                                style={{ width: `${job.progress}%` }}
                                            />
                                        </div>
                                    )}
                                    <span className={cn("text-xs font-medium", config.color)}>
                                        {config.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
