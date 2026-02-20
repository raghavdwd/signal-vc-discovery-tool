"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    List,
    Trash2,
    MoreHorizontal,
    Download,
    Copy,
    Users,
    Calendar,
    X,
    Building2,
    ExternalLink,
    FileJson,
    FileSpreadsheet,
} from "lucide-react";
import { useListStore, useCompanyStore } from "@/lib/stores";
import { cn, formatCurrency, STAGE_COLORS, timeAgo } from "@/lib/utils";
import { toast } from "sonner";

export default function ListsPage() {
    const { lists, createList, deleteList, renameList, removeFromList } = useListStore();
    const { companies } = useCompanyStore();
    const [showCreate, setShowCreate] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [selectedList, setSelectedList] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleCreate = () => {
        if (!newListName.trim()) return;
        const list = createList(newListName.trim());
        setNewListName("");
        setShowCreate(false);
        setSelectedList(list.id);
        toast.success("List created");
    };

    const handleExportJSON = (listId: string) => {
        const list = lists.find((l) => l.id === listId);
        if (!list) return;
        const listCompanies = companies.filter((c) => list.company_ids.includes(c.id));
        const data = listCompanies.map((c) => ({
            name: c.name, website: c.website, funding_stage: c.funding_stage,
            raised_amount: c.raised_amount, location: c.location, sector: c.sector,
            employee_count: c.employee_count, tags: c.tags,
        }));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${list.name.toLowerCase().replace(/\s+/g, "-")}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported as JSON");
    };

    const handleExportCSV = (listId: string) => {
        const list = lists.find((l) => l.id === listId);
        if (!list) return;
        const listCompanies = companies.filter((c) => list.company_ids.includes(c.id));
        const headers = ["Name", "Website", "Stage", "Raised", "Location", "Sector", "Employees", "Tags"];
        const rows = listCompanies.map((c) =>
            [c.name, c.website, c.funding_stage, c.raised_amount, c.location, c.sector, c.employee_count, c.tags.join(";")].join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${list.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported as CSV");
    };

    const handleCopyLink = (listId: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/lists?id=${listId}`);
        toast.success("Link copied to clipboard");
    };

    const activeList = lists.find((l) => l.id === selectedList);
    const activeListCompanies = activeList
        ? companies.filter((c) => activeList.company_ids.includes(c.id))
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold tracking-tight"
                    >
                        Lists & Collections
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-1 text-muted-foreground"
                    >
                        Organize and export your company research
                    </motion.p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    New List
                </button>
            </div>

            {/* Create modal */}
            <AnimatePresence>
                {showCreate && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowCreate(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="fixed left-1/2 top-1/3 z-50 w-full max-w-md -translate-x-1/2 rounded-xl border border-border bg-card p-6 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Create New List</h2>
                                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <input
                                autoFocus
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                placeholder="List name..."
                                className="mt-4 w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => setShowCreate(false)} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                                    Cancel
                                </button>
                                <button onClick={handleCreate} disabled={!newListName.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {lists.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                    <List className="h-12 w-12 text-muted-foreground/30" />
                    <h3 className="mt-4 text-lg font-semibold">No lists yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create your first list to start organizing companies
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Create List
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* List sidebar */}
                    <div className="space-y-2">
                        {lists.map((list) => (
                            <button
                                key={list.id}
                                onClick={() => setSelectedList(list.id)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                                    selectedList === list.id
                                        ? "border-primary/30 bg-primary/5"
                                        : "border-border bg-card hover:bg-secondary/50"
                                )}
                            >
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg",
                                    selectedList === list.id ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                                )}>
                                    <List className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {editingId === list.id ? (
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onBlur={() => {
                                                if (editName.trim()) renameList(list.id, editName.trim());
                                                setEditingId(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    if (editName.trim()) renameList(list.id, editName.trim());
                                                    setEditingId(null);
                                                }
                                            }}
                                            className="w-full bg-transparent text-sm font-semibold outline-none border-b border-primary"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <p
                                            className="text-sm font-semibold truncate"
                                            onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                setEditingId(list.id);
                                                setEditName(list.name);
                                            }}
                                        >
                                            {list.name}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {list.company_ids.length} companies · {timeAgo(list.updated_at)}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* List detail */}
                    <div className="lg:col-span-2">
                        {activeList ? (
                            <div className="rounded-xl border border-border bg-card overflow-hidden">
                                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">{activeList.name}</h2>
                                        <p className="text-xs text-muted-foreground">{activeListCompanies.length} companies</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleExportJSON(activeList.id)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors">
                                            <FileJson className="h-3.5 w-3.5" /> JSON
                                        </button>
                                        <button onClick={() => handleExportCSV(activeList.id)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors">
                                            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                                        </button>
                                        <button onClick={() => handleCopyLink(activeList.id)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors">
                                            <Copy className="h-3.5 w-3.5" /> Share
                                        </button>
                                        <button
                                            onClick={() => {
                                                deleteList(activeList.id);
                                                setSelectedList(null);
                                                toast.success("List deleted");
                                            }}
                                            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>

                                {activeListCompanies.length === 0 ? (
                                    <div className="flex flex-col items-center py-16 text-center">
                                        <Building2 className="h-10 w-10 text-muted-foreground/30" />
                                        <h3 className="mt-3 font-semibold">Empty list</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Add companies from the Discovery Hub
                                        </p>
                                        <Link
                                            href="/companies"
                                            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                        >
                                            Browse Companies
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {activeListCompanies.map((company) => (
                                            <div key={company.id} className="flex items-center gap-4 px-5 py-3 group hover:bg-secondary/30 transition-colors">
                                                <div
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${company.logo_gradient[0]}, ${company.logo_gradient[1]})`,
                                                    }}
                                                >
                                                    {company.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/companies/${company.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
                                                        {company.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {company.funding_stage} · {company.sector} · {formatCurrency(company.raised_amount)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        removeFromList(activeList.id, company.id);
                                                        toast.success("Removed from list");
                                                    }}
                                                    className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
                                <List className="h-10 w-10 text-muted-foreground/30" />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Select a list to view its contents
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
