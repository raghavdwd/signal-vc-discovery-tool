"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
    Company,
    CompanyList,
    EnrichmentCredits,
    EnrichmentJob,
    FilterState,
    Note,
    SavedSearch,
    Signal,
    UIPreferences,
    EnrichmentResult,
} from "@/types";
import { createSeedCompanies, createSeedSignals } from "@/lib/data/seed";
import { generateId } from "@/lib/utils";

// ============================================================
// Company Store
// ============================================================

interface CompanyStore {
    companies: Company[];
    initialized: boolean;
    init: () => void;
    getCompany: (id: string) => Company | undefined;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    addEnrichment: (id: string, result: EnrichmentResult) => void;
    addNote: (companyId: string, content: string) => void;
    deleteNote: (companyId: string, noteId: string) => void;
    getFilteredCompanies: (filters: FilterState) => Company[];
}

export const useCompanyStore = create<CompanyStore>()(
    persist(
        (set, get) => ({
            companies: [],
            initialized: false,

            init: () => {
                if (get().initialized && get().companies.length > 0) return;
                set({ companies: createSeedCompanies(), initialized: true });
            },

            getCompany: (id) => get().companies.find((c) => c.id === id),

            updateCompany: (id, updates) =>
                set((state) => ({
                    companies: state.companies.map((c) =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                })),

            addEnrichment: (id, result) =>
                set((state) => ({
                    companies: state.companies.map((c) =>
                        c.id === id
                            ? {
                                ...c,
                                enrichment_data: result,
                                enrichment_history: [result, ...c.enrichment_history],
                                last_enriched: result.timestamp,
                            }
                            : c
                    ),
                })),

            addNote: (companyId, content) => {
                const note: Note = {
                    id: generateId(),
                    content,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                set((state) => ({
                    companies: state.companies.map((c) =>
                        c.id === companyId ? { ...c, notes: [note, ...c.notes] } : c
                    ),
                }));
            },

            deleteNote: (companyId, noteId) =>
                set((state) => ({
                    companies: state.companies.map((c) =>
                        c.id === companyId
                            ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) }
                            : c
                    ),
                })),

            getFilteredCompanies: (filters) => {
                let result = get().companies;

                if (filters.search) {
                    const q = filters.search.toLowerCase();
                    result = result.filter(
                        (c) =>
                            c.name.toLowerCase().includes(q) ||
                            c.description.toLowerCase().includes(q) ||
                            c.tags.some((t) => t.includes(q))
                    );
                }

                if (filters.funding_stages.length > 0) {
                    result = result.filter((c) =>
                        filters.funding_stages.includes(c.funding_stage)
                    );
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
                    result = result.filter((c) =>
                        filters.locations.includes(c.location)
                    );
                }

                if (filters.tags.length > 0) {
                    result = result.filter((c) =>
                        filters.tags.some((t) => c.tags.includes(t))
                    );
                }

                if (filters.recently_enriched) {
                    result = result.filter((c) => c.last_enriched !== null);
                }

                return result;
            },
        }),
        { name: "signal-companies" }
    )
);

// ============================================================
// List Store
// ============================================================

interface ListStore {
    lists: CompanyList[];
    createList: (name: string, description?: string) => CompanyList;
    deleteList: (id: string) => void;
    renameList: (id: string, name: string) => void;
    addToList: (listId: string, companyIds: string[]) => void;
    removeFromList: (listId: string, companyId: string) => void;
}

export const useListStore = create<ListStore>()(
    persist(
        (set, get) => ({
            lists: [],

            createList: (name, description = "") => {
                const list: CompanyList = {
                    id: generateId(),
                    name,
                    description,
                    company_ids: [],
                    is_smart: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                set((state) => ({ lists: [list, ...state.lists] }));
                return list;
            },

            deleteList: (id) =>
                set((state) => ({ lists: state.lists.filter((l) => l.id !== id) })),

            renameList: (id, name) =>
                set((state) => ({
                    lists: state.lists.map((l) =>
                        l.id === id ? { ...l, name, updated_at: new Date().toISOString() } : l
                    ),
                })),

            addToList: (listId, companyIds) =>
                set((state) => ({
                    lists: state.lists.map((l) =>
                        l.id === listId
                            ? {
                                ...l,
                                company_ids: [...new Set([...l.company_ids, ...companyIds])],
                                updated_at: new Date().toISOString(),
                            }
                            : l
                    ),
                })),

            removeFromList: (listId, companyId) =>
                set((state) => ({
                    lists: state.lists.map((l) =>
                        l.id === listId
                            ? {
                                ...l,
                                company_ids: l.company_ids.filter((id) => id !== companyId),
                                updated_at: new Date().toISOString(),
                            }
                            : l
                    ),
                })),
        }),
        { name: "signal-lists" }
    )
);

// ============================================================
// Signal Store
// ============================================================

interface SignalStore {
    signals: Signal[];
    initialized: boolean;
    init: (companies: Company[]) => void;
    markRead: (id: string) => void;
    markAllRead: () => void;
    getUnreadCount: () => number;
}

export const useSignalStore = create<SignalStore>()(
    persist(
        (set, get) => ({
            signals: [],
            initialized: false,

            init: (companies) => {
                if (get().initialized && get().signals.length > 0) return;
                set({ signals: createSeedSignals(companies), initialized: true });
            },

            markRead: (id) =>
                set((state) => ({
                    signals: state.signals.map((s) =>
                        s.id === id ? { ...s, read: true } : s
                    ),
                })),

            markAllRead: () =>
                set((state) => ({
                    signals: state.signals.map((s) => ({ ...s, read: true })),
                })),

            getUnreadCount: () => get().signals.filter((s) => !s.read).length,
        }),
        { name: "signal-signals" }
    )
);

// ============================================================
// Enrichment Store
// ============================================================

interface EnrichmentStore {
    jobs: EnrichmentJob[];
    credits: EnrichmentCredits;
    addJob: (companyId: string, companyName: string) => EnrichmentJob;
    updateJob: (id: string, updates: Partial<EnrichmentJob>) => void;
    getJobsForCompany: (companyId: string) => EnrichmentJob[];
    useCredit: () => boolean;
    resetCredits: () => void;
}

export const useEnrichmentStore = create<EnrichmentStore>()(
    persist(
        (set, get) => ({
            jobs: [],
            credits: {
                used: 0,
                total: 50,
                resets_at: new Date(Date.now() + 86_400_000).toISOString(),
            },

            addJob: (companyId, companyName) => {
                const job: EnrichmentJob = {
                    id: generateId(),
                    company_id: companyId,
                    company_name: companyName,
                    status: "pending",
                    progress: 0,
                    step: "queued",
                    created_at: new Date().toISOString(),
                };
                set((state) => ({ jobs: [job, ...state.jobs] }));
                return job;
            },

            updateJob: (id, updates) =>
                set((state) => ({
                    jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
                })),

            getJobsForCompany: (companyId) =>
                get().jobs.filter((j) => j.company_id === companyId),

            useCredit: () => {
                const { credits } = get();
                if (credits.used >= credits.total) return false;
                set((state) => ({
                    credits: { ...state.credits, used: state.credits.used + 1 },
                }));
                return true;
            },

            resetCredits: () =>
                set((state) => ({
                    credits: {
                        ...state.credits,
                        used: 0,
                        resets_at: new Date(Date.now() + 86_400_000).toISOString(),
                    },
                })),
        }),
        { name: "signal-enrichment" }
    )
);

// ============================================================
// Saved Search Store
// ============================================================

interface SavedSearchStore {
    searches: SavedSearch[];
    history: FilterState[];
    saveSearch: (name: string, filters: FilterState, resultCount: number) => void;
    deleteSearch: (id: string) => void;
    toggleAlerts: (id: string) => void;
    addToHistory: (filters: FilterState) => void;
}

export const useSavedSearchStore = create<SavedSearchStore>()(
    persist(
        (set) => ({
            searches: [],
            history: [],

            saveSearch: (name, filters, resultCount) => {
                const search: SavedSearch = {
                    id: generateId(),
                    name,
                    filters,
                    alerts_enabled: false,
                    created_at: new Date().toISOString(),
                    last_run: new Date().toISOString(),
                    result_count: resultCount,
                };
                set((state) => ({ searches: [search, ...state.searches] }));
            },

            deleteSearch: (id) =>
                set((state) => ({
                    searches: state.searches.filter((s) => s.id !== id),
                })),

            toggleAlerts: (id) =>
                set((state) => ({
                    searches: state.searches.map((s) =>
                        s.id === id ? { ...s, alerts_enabled: !s.alerts_enabled } : s
                    ),
                })),

            addToHistory: (filters) =>
                set((state) => ({
                    history: [filters, ...state.history.slice(0, 19)],
                })),
        }),
        { name: "signal-saved-searches" }
    )
);

// ============================================================
// UI Store
// ============================================================

interface UIStore {
    preferences: UIPreferences;
    commandPaletteOpen: boolean;
    setPreference: <K extends keyof UIPreferences>(key: K, value: UIPreferences[K]) => void;
    toggleTheme: () => void;
    toggleSidebar: () => void;
    setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
    persist(
        (set, get) => ({
            preferences: {
                view_mode: "table",
                density: "comfortable",
                theme: "dark",
                sidebar_collapsed: false,
            },
            commandPaletteOpen: false,

            setPreference: (key, value) =>
                set((state) => ({
                    preferences: { ...state.preferences, [key]: value },
                })),

            toggleTheme: () =>
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        theme: state.preferences.theme === "dark" ? "light" : "dark",
                    },
                })),

            toggleSidebar: () =>
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        sidebar_collapsed: !state.preferences.sidebar_collapsed,
                    },
                })),

            setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
        }),
        {
            name: "signal-ui",
            partialize: (state) => ({ preferences: state.preferences }),
        }
    )
);

// ============================================================
// Settings Store — API Key Management
// ============================================================

interface SettingsStore {
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
    clearGeminiApiKey: () => void;
    hasApiKey: () => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            geminiApiKey: "",

            setGeminiApiKey: (key) => set({ geminiApiKey: key.trim() }),

            clearGeminiApiKey: () => set({ geminiApiKey: "" }),

            hasApiKey: () => get().geminiApiKey.length > 0,
        }),
        { name: "signal-settings" }
    )
);

// ============================================================
// AI Results Store — Cached enrichment, memo, chat per company
// ============================================================

interface ChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: string;
}

interface CompanyAIData {
    enrichment: Record<string, unknown> | null;
    enrichedAt: string | null;
    memo: Record<string, unknown> | null;
    memoGeneratedAt: string | null;
    chatHistory: ChatMessage[];
}

interface AIResultsStore {
    results: Record<string, CompanyAIData>;
    setEnrichment: (companyId: string, data: Record<string, unknown>) => void;
    setMemo: (companyId: string, data: Record<string, unknown>) => void;
    getEnrichment: (companyId: string) => Record<string, unknown> | null;
    getMemo: (companyId: string) => Record<string, unknown> | null;
    setChatHistory: (companyId: string, messages: ChatMessage[]) => void;
    getChatHistory: (companyId: string) => ChatMessage[];
    clearCompanyData: (companyId: string) => void;
}

const emptyData: CompanyAIData = {
    enrichment: null,
    enrichedAt: null,
    memo: null,
    memoGeneratedAt: null,
    chatHistory: [],
};

export const useAIResultsStore = create<AIResultsStore>()(
    persist(
        (set, get) => ({
            results: {},

            setEnrichment: (companyId, data) =>
                set((state) => ({
                    results: {
                        ...state.results,
                        [companyId]: {
                            ...(state.results[companyId] || emptyData),
                            enrichment: data,
                            enrichedAt: new Date().toISOString(),
                        },
                    },
                })),

            setMemo: (companyId, data) =>
                set((state) => ({
                    results: {
                        ...state.results,
                        [companyId]: {
                            ...(state.results[companyId] || emptyData),
                            memo: data,
                            memoGeneratedAt: new Date().toISOString(),
                        },
                    },
                })),

            getEnrichment: (companyId) =>
                get().results[companyId]?.enrichment || null,

            getMemo: (companyId) =>
                get().results[companyId]?.memo || null,

            setChatHistory: (companyId, messages) =>
                set((state) => ({
                    results: {
                        ...state.results,
                        [companyId]: {
                            ...(state.results[companyId] || emptyData),
                            chatHistory: messages,
                        },
                    },
                })),

            getChatHistory: (companyId) =>
                get().results[companyId]?.chatHistory || [],

            clearCompanyData: (companyId) =>
                set((state) => ({
                    results: {
                        ...state.results,
                        [companyId]: { ...emptyData },
                    },
                })),
        }),
        { name: "signal-ai-results" }
    )
);
