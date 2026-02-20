"use client";

import { useState, useCallback } from "react";
import type { GeminiEnrichmentData } from "@/lib/gemini/schemas";
import { useSettingsStore } from "@/lib/stores";

// ============================================================
// Hook: useGeminiEnrichment
// Calls /api/enrich/gemini and returns structured analysis data
// ============================================================

export function useGeminiEnrichment() {
    const [isEnriching, setIsEnriching] = useState(false);
    const [progress, setProgress] = useState("");
    const [error, setError] = useState<string | null>(null);

    const enrichCompany = useCallback(
        async (
            companyName: string,
            websiteUrl: string,
            additionalContext?: string
        ): Promise<GeminiEnrichmentData | null> => {
            const apiKey = useSettingsStore.getState().geminiApiKey;
            if (!apiKey) {
                setError("Gemini API key is required. Please add your key in Settings.");
                return null;
            }

            setIsEnriching(true);
            setError(null);
            setProgress("Initializing Gemini AI analysis…");

            try {
                setProgress("Analyzing website content with Gemini 2.5 Flash…");

                const response = await fetch("/api/enrich/gemini", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ companyName, websiteUrl, additionalContext, apiKey }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "Enrichment failed");
                }

                setProgress("Processing structured output…");
                const result = await response.json();
                setProgress("Analysis complete!");

                return result.data;
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Unknown error";
                setError(msg);
                setProgress("Analysis failed");
                return null;
            } finally {
                setIsEnriching(false);
            }
        },
        []
    );

    return { enrichCompany, isEnriching, progress, error };
}

// ============================================================
// Hook: useInvestmentMemo
// Calls /api/memo/generate for deep IC-quality analysis
// ============================================================

import type { GeminiMemoData } from "@/lib/gemini/schemas";

export function useInvestmentMemo() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState("");
    const [error, setError] = useState<string | null>(null);

    const generateMemo = useCallback(
        async (
            companyData: Record<string, unknown>,
            enrichmentData?: GeminiEnrichmentData | null
        ): Promise<GeminiMemoData | null> => {
            const apiKey = useSettingsStore.getState().geminiApiKey;
            if (!apiKey) {
                setError("Gemini API key is required. Please add your key in Settings.");
                return null;
            }

            setIsGenerating(true);
            setError(null);
            setProgress("Generating investment memo with Gemini Pro…");

            try {
                const response = await fetch("/api/memo/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ companyData, enrichmentData, apiKey }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "Memo generation failed");
                }

                setProgress("Deep analysis complete!");
                const result = await response.json();
                return result.memo;
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Unknown error";
                setError(msg);
                setProgress("Generation failed");
                return null;
            } finally {
                setIsGenerating(false);
            }
        },
        []
    );

    return { generateMemo, isGenerating, progress, error };
}

// ============================================================
// Hook: useCompanyChat
// Real-time Q&A chat with company data context
// ============================================================

export interface ChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: string;
}

export function useCompanyChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (
            message: string,
            companyContext: Record<string, unknown>
        ): Promise<string | null> => {
            const apiKey = useSettingsStore.getState().geminiApiKey;
            if (!apiKey) {
                setError("Gemini API key is required. Please add your key in Settings.");
                return null;
            }

            setIsLoading(true);
            setError(null);

            const userMessage: ChatMessage = {
                role: "user",
                content: message,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMessage]);

            try {
                const response = await fetch("/api/chat/company", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message,
                        companyContext,
                        apiKey,
                        history: messages.map((m) => ({
                            role: m.role,
                            content: m.content,
                        })),
                    }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "Chat failed");
                }

                const result = await response.json();
                const aiMessage: ChatMessage = {
                    role: "model",
                    content: result.response,
                    timestamp: result.timestamp,
                };
                setMessages((prev) => [...prev, aiMessage]);
                return result.response;
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Unknown error";
                setError(msg);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [messages]
    );

    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return { messages, sendMessage, clearChat, isLoading, error, setMessages };
}
