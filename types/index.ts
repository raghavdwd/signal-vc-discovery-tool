// ============================================================
// Signal VC Platform - Core Type Definitions
// ============================================================

export type FundingStage =
    | "Pre-Seed"
    | "Seed"
    | "Series A"
    | "Series B"
    | "Series C"
    | "Series D";

export type Sector =
    | "AI/ML"
    | "Fintech"
    | "Climate"
    | "Health"
    | "SaaS"
    | "DevTools"
    | "Security"
    | "EdTech"
    | "Web3"
    | "Logistics";

export interface Company {
    id: string;
    name: string;
    website: string;
    funding_stage: FundingStage;
    raised_amount: number; // in millions USD
    location: string;
    description: string;
    founded_year: number;
    employee_count: number;
    tags: string[];
    sector: Sector;
    last_enriched: string | null; // ISO date
    enrichment_data: EnrichmentResult | null;
    enrichment_history: EnrichmentResult[];
    notes: Note[];
    created_at: string;
    logo_gradient: [string, string]; // two hex colors for gradient avatar
}

export interface EnrichmentResult {
    id: string;
    company_id: string;
    timestamp: string;
    summary: string;
    what_they_do: string[];
    keywords: string[];
    has_careers_page: boolean;
    recent_blog_posts: number;
    changelog_detected: boolean;
    tech_stack: string[];
    hiring_velocity: "low" | "medium" | "high" | "unknown";
    sources: EnrichmentSource[];
    raw_signals: DerivedSignal[];
}

export interface EnrichmentSource {
    url: string;
    title: string;
    status: "scraped" | "failed" | "skipped";
    scraped_at?: string;
}

export interface DerivedSignal {
    type: SignalType;
    label: string;
    value: string | number | boolean;
    confidence: number; // 0–1
}

export type SignalType =
    | "hiring_spike"
    | "new_funding"
    | "leadership_change"
    | "tech_stack_update"
    | "careers_page"
    | "blog_active"
    | "changelog_present"
    | "growth_signal";

export interface Signal {
    id: string;
    company_id: string;
    company_name: string;
    type: SignalType;
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
    created_at: string;
    read: boolean;
}

export interface CompanyList {
    id: string;
    name: string;
    description: string;
    company_ids: string[];
    is_smart: boolean;
    smart_filters?: FilterState;
    created_at: string;
    updated_at: string;
}

export interface FilterState {
    search: string;
    funding_stages: FundingStage[];
    sectors: Sector[];
    funding_min: number;
    funding_max: number;
    locations: string[];
    tags: string[];
    recently_enriched: boolean;
}

export interface SavedSearch {
    id: string;
    name: string;
    filters: FilterState;
    alerts_enabled: boolean;
    created_at: string;
    last_run: string | null;
    result_count: number;
}

export interface Note {
    id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface EnrichmentJob {
    id: string;
    company_id: string;
    company_name: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number; // 0–100
    step: "queued" | "discovering" | "scraping" | "analyzing" | "synthesizing" | "done" | "error";
    result?: EnrichmentResult;
    error?: string;
    created_at: string;
    completed_at?: string;
}

export interface EnrichmentCredits {
    used: number;
    total: number;
    resets_at: string; // ISO date
}

export type ViewMode = "table" | "card";
export type Density = "compact" | "comfortable";
export type ThemeMode = "dark" | "light";

export interface UIPreferences {
    view_mode: ViewMode;
    density: Density;
    theme: ThemeMode;
    sidebar_collapsed: boolean;
}

// Investment Memo
export interface InvestmentMemo {
    id: string;
    company_id: string;
    market_analysis: string;
    product_overview: string;
    team_assessment: string;
    traction_metrics: string;
    risks: string[];
    recommendation: string;
    generated_at: string;
}
