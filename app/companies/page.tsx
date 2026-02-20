"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    SlidersHorizontal,
    LayoutGrid,
    TableIcon,
    ChevronLeft,
    ChevronRight,
    X,
    Building2,
    MapPin,
    Users,
    Calendar,
    Sparkles,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter,
    ExternalLink,
} from "lucide-react";
import { useCompanyStore, useUIStore } from "@/lib/stores";
import { cn, formatCurrency, STAGE_COLORS, timeAgo, LOCATIONS, ALL_TAGS } from "@/lib/utils";
import type { Company, FundingStage, Sector, FilterState } from "@/types";

const FUNDING_STAGES: FundingStage[] = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Series D"];
const SECTORS: Sector[] = ["AI/ML", "Fintech", "Climate", "Health", "SaaS", "DevTools", "Security", "EdTech", "Web3", "Logistics"];
const PAGE_SIZE = 20;

type SortField = "name" | "raised_amount" | "founded_year" | "employee_count" | "last_enriched";
type SortDir = "asc" | "desc";

const defaultFilters: FilterState = {
    search: "",
    funding_stages: [],
    sectors: [],
    funding_min: 0,
    funding_max: 1000,
    locations: [],
    tags: [],
    recently_enriched: false,
};

export default function CompaniesPage() {
    const { companies } = useCompanyStore();
    const { preferences, setPreference } = useUIStore();

    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState<SortField>("raised_amount");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const filteredCompanies = useMemo(() => {
        let result = [...companies];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q) ||
                    c.tags.some((t) => t.includes(q)) ||
                    c.sector.toLowerCase().includes(q)
            );
        }
        if (filters.funding_stages.length > 0) {
            result = result.filter((c) => filters.funding_stages.includes(c.funding_stage));
        }
        if (filters.sectors.length > 0) {
            result = result.filter((c) => filters.sectors.includes(c.sector));
        }
        if (filters.funding_min > 0) {
            result = result.filter((c) => c.raised_amount >= filters.funding_min);
        }
        if (filters.funding_max < 1000) {
            result = result.filter((c) => c.raised_amount <= filters.funding_max);
        }
        if (filters.locations.length > 0) {
            result = result.filter((c) => filters.locations.includes(c.location));
        }
        if (filters.tags.length > 0) {
            result = result.filter((c) => filters.tags.some((t) => c.tags.includes(t)));
        }
        if (filters.recently_enriched) {
            result = result.filter((c) => c.last_enriched !== null);
        }

        // Sorting
        result.sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case "name":
                    cmp = a.name.localeCompare(b.name);
                    break;
                case "raised_amount":
                    cmp = a.raised_amount - b.raised_amount;
                    break;
                case "founded_year":
                    cmp = a.founded_year - b.founded_year;
                    break;
                case "employee_count":
                    cmp = a.employee_count - b.employee_count;
                    break;
                case "last_enriched":
                    cmp =
                        (a.last_enriched ? new Date(a.last_enriched).getTime() : 0) -
                        (b.last_enriched ? new Date(b.last_enriched).getTime() : 0);
                    break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return result;
    }, [companies, filters, sortField, sortDir]);

    const totalPages = Math.ceil(filteredCompanies.length / PAGE_SIZE);
    const paginatedCompanies = filteredCompanies.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const toggleSort = useCallback(
        (field: SortField) => {
            if (sortField === field) {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            } else {
                setSortField(field);
                setSortDir("desc");
            }
        },
        [sortField]
    );

    const toggleFilter = <K extends keyof FilterState>(
        key: K,
        value: FilterState[K] extends (infer U)[] ? U : never
    ) => {
        setFilters((prev) => {
            const arr = prev[key] as unknown[];
            const next = arr.includes(value)
                ? arr.filter((v) => v !== value)
                : [...arr, value];
            return { ...prev, [key]: next };
        });
        setPage(1);
    };

    const activeFilterCount =
        filters.funding_stages.length +
        filters.sectors.length +
        filters.locations.length +
        filters.tags.length +
        (filters.recently_enriched ? 1 : 0) +
        (filters.funding_min > 0 ? 1 : 0) +
        (filters.funding_max < 1000 ? 1 : 0);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
        return sortDir === "asc" ? (
            <ArrowUp className="h-3 w-3 text-primary" />
        ) : (
            <ArrowDown className="h-3 w-3 text-primary" />
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold tracking-tight"
                >
                    Discovery Hub
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-1 text-muted-foreground"
                >
                    {filteredCompanies.length} companies · {activeFilterCount > 0 ? `${activeFilterCount} filters active` : "All companies"}
                </motion.p>
            </div>

            {/* Search & controls bar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search companies, sectors, tags..."
                        value={filters.search}
                        onChange={(e) => {
                            setFilters((f) => ({ ...f, search: e.target.value }));
                            setPage(1);
                        }}
                        className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                    {filters.search && (
                        <button
                            onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                        showFilters || activeFilterCount > 0
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <div className="flex items-center rounded-lg border border-border bg-card p-1">
                    <button
                        onClick={() => setPreference("view_mode", "table")}
                        className={cn(
                            "rounded-md p-2 transition-colors",
                            preferences.view_mode === "table"
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label="Table view"
                    >
                        <TableIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setPreference("view_mode", "card")}
                        className={cn(
                            "rounded-md p-2 transition-colors",
                            preferences.view_mode === "card"
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label="Card view"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                            {/* Funding Stages */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Funding Stage
                                </label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {FUNDING_STAGES.map((stage) => {
                                        const active = filters.funding_stages.includes(stage);
                                        const colors = STAGE_COLORS[stage];
                                        return (
                                            <button
                                                key={stage}
                                                onClick={() => toggleFilter("funding_stages", stage)}
                                                className={cn(
                                                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                                                    active
                                                        ? `${colors.bg} ${colors.text} ring-1 ring-current`
                                                        : "bg-secondary text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {stage}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sectors */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Sector
                                </label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {SECTORS.map((sector) => {
                                        const active = filters.sectors.includes(sector);
                                        return (
                                            <button
                                                key={sector}
                                                onClick={() => toggleFilter("sectors", sector)}
                                                className={cn(
                                                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                                                    active
                                                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                                                        : "bg-secondary text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {sector}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Location
                                </label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {LOCATIONS.slice(0, 8).map((loc) => {
                                        const active = filters.locations.includes(loc);
                                        return (
                                            <button
                                                key={loc}
                                                onClick={() => toggleFilter("locations", loc)}
                                                className={cn(
                                                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                                                    active
                                                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                                                        : "bg-secondary text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {loc}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Clear */}
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={() => {
                                        setFilters(defaultFilters);
                                        setPage(1);
                                    }}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table view */}
            {preferences.view_mode === "table" ? (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" role="table">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        <button onClick={() => toggleSort("name")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                            Company <SortIcon field="name" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Stage
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        <button onClick={() => toggleSort("raised_amount")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                            Raised <SortIcon field="raised_amount" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                                        Location
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                                        <button onClick={() => toggleSort("employee_count")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                            Team <SortIcon field="employee_count" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                                        Sector
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                                        <button onClick={() => toggleSort("last_enriched")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                            Enriched <SortIcon field="last_enriched" />
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCompanies.map((company, i) => (
                                    <motion.tr
                                        key={company.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors group"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/companies/${company.id}`}
                                                className="flex items-center gap-3 group-hover:text-primary transition-colors"
                                            >
                                                <div
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${company.logo_gradient[0]}, ${company.logo_gradient[1]})`,
                                                    }}
                                                >
                                                    {company.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold truncate">{company.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {company.description.slice(0, 60)}…
                                                    </p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                                                    STAGE_COLORS[company.funding_stage].bg,
                                                    STAGE_COLORS[company.funding_stage].text
                                                )}
                                            >
                                                <span className={cn("h-1.5 w-1.5 rounded-full", STAGE_COLORS[company.funding_stage].dot)} />
                                                {company.funding_stage}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 mono font-medium">
                                            {formatCurrency(company.raised_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {company.location.split(",")[0]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {company.employee_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
                                                {company.sector}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                                            {company.last_enriched ? (
                                                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                                                    <Sparkles className="h-3 w-3" />
                                                    {timeAgo(company.last_enriched)}
                                                </span>
                                            ) : (
                                                <span className="text-xs">—</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Card grid view */
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedCompanies.map((company, i) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <Link
                                href={`/companies/${company.id}`}
                                className="block rounded-xl border border-border bg-card p-5 card-hover"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                                        style={{
                                            background: `linear-gradient(135deg, ${company.logo_gradient[0]}, ${company.logo_gradient[1]})`,
                                        }}
                                    >
                                        {company.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold truncate">{company.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span
                                                className={cn(
                                                    "text-xs font-medium",
                                                    STAGE_COLORS[company.funding_stage].text
                                                )}
                                            >
                                                {company.funding_stage}
                                            </span>
                                            <span className="text-xs text-muted-foreground">·</span>
                                            <span className="text-xs text-muted-foreground mono">
                                                {formatCurrency(company.raised_amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {company.description}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {company.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {company.location.split(",")[0]}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {company.employee_count}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {company.founded_year}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {filteredCompanies.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/30" />
                    <h3 className="mt-4 text-lg font-semibold">No companies found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your filters or search query
                    </p>
                    <button
                        onClick={() => {
                            setFilters(defaultFilters);
                            setPage(1);
                        }}
                        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCompanies.length)} of{" "}
                        {filteredCompanies.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={cn(
                                    "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                                    p === page
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
