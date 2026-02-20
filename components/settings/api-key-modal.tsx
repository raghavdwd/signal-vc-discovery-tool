"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, X, ExternalLink, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useSettingsStore } from "@/lib/stores";
import { toast } from "sonner";

interface ApiKeyModalProps {
    open: boolean;
    onClose: () => void;
}

export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
    const { geminiApiKey, setGeminiApiKey, clearGeminiApiKey } = useSettingsStore();
    const [inputValue, setInputValue] = useState("");
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        if (open) {
            setInputValue(geminiApiKey);
            setShowKey(false);
        }
    }, [open, geminiApiKey]);

    const handleSave = () => {
        if (!inputValue.trim()) {
            toast.error("Please enter a valid API key");
            return;
        }
        setGeminiApiKey(inputValue);
        toast.success("Gemini API key saved!");
        onClose();
    };

    const handleClear = () => {
        clearGeminiApiKey();
        setInputValue("");
        toast.success("API key cleared");
    };

    const hasKey = geminiApiKey.length > 0;
    const maskedKey = geminiApiKey
        ? `${geminiApiKey.slice(0, 6)}${"•".repeat(20)}${geminiApiKey.slice(-4)}`
        : "";

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={hasKey ? onClose : undefined}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="rounded-2xl border border-border bg-card shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
                                        <Key className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold">Gemini API Key</h2>
                                        <p className="text-xs text-muted-foreground">Required for AI features</p>
                                    </div>
                                </div>
                                {hasKey && (
                                    <button
                                        onClick={onClose}
                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5 space-y-4">
                                {/* Status indicator */}
                                {hasKey ? (
                                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-emerald-400">API key configured</p>
                                            <p className="text-xs text-muted-foreground mono mt-0.5">{maskedKey}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                                        <p className="text-xs font-medium text-amber-400">
                                            No API key set — AI features are disabled
                                        </p>
                                    </div>
                                )}

                                {/* Input */}
                                <div>
                                    <label htmlFor="api-key-input" className="text-xs font-medium text-muted-foreground">
                                        {hasKey ? "Update API Key" : "Enter your Gemini API Key"}
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            id="api-key-input"
                                            type={showKey ? "text" : "password"}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                            placeholder="AIzaSy..."
                                            className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 pr-10 text-sm mono placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowKey(!showKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showKey ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Help link */}
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Get a free API key from Google AI Studio
                                </a>

                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Your API key is stored locally in your browser and is only sent to Google&apos;s Gemini API. It is never stored on any server.
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t border-border px-6 py-4">
                                <div>
                                    {hasKey && (
                                        <button
                                            onClick={handleClear}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Clear key
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {hasKey && (
                                        <button
                                            onClick={onClose}
                                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={!inputValue.trim()}
                                        className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40"
                                    >
                                        Save Key
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
