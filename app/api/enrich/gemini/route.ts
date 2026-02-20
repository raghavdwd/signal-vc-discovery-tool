import { NextRequest, NextResponse } from "next/server";
import { getGenAI, getModel } from "@/lib/gemini/client";
import {
    COMPANY_ENRICHMENT_SCHEMA,
    type GeminiEnrichmentData,
} from "@/lib/gemini/schemas";

// ============================================================
// POST /api/enrich/gemini
// AI-powered company enrichment using Gemini structured output
// ============================================================

export async function POST(req: NextRequest) {
    try {
        const { companyName, websiteUrl, additionalContext, apiKey } = await req.json();

        if (!companyName || !websiteUrl) {
            return NextResponse.json(
                { error: "companyName and websiteUrl are required" },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key is required. Please add your key in Settings." },
                { status: 401 }
            );
        }

        // Fetch website content for context
        let websiteContent = "";
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(websiteUrl, { signal: controller.signal });
            clearTimeout(timeout);
            const html = await res.text();
            // Strip HTML tags, compress whitespace, truncate
            websiteContent = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 12000);
        } catch {
            websiteContent = "Website content could not be fetched.";
        }

        const prompt = `You are a senior VC analyst at a top-tier venture capital fund. Analyze the following company and provide a structured investment analysis.

Company Name: ${companyName}
Website: ${websiteUrl}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Website Content (extracted text):
${websiteContent}

Provide a comprehensive but concise VC-style analysis. Be objective and highlight both opportunities and risks. Base your analysis on the website content provided — if information is not available, indicate "Unknown" for that field.`;

        const response = await getGenAI(apiKey).models.generateContent({
            model: getModel("balanced"),
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: COMPANY_ENRICHMENT_SCHEMA,
                thinkingConfig: {
                    thinkingBudget: 2048,
                },
                temperature: 0.2,
            },
        });

        const text = response.text;
        if (!text) {
            return NextResponse.json(
                { error: "No response from Gemini" },
                { status: 500 }
            );
        }

        const data: GeminiEnrichmentData = JSON.parse(text);

        return NextResponse.json({
            success: true,
            data,
            model: getModel("balanced"),
            processedAt: new Date().toISOString(),
        });
    } catch (error: unknown) {
        console.error("Gemini enrichment error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to analyze company", details: message },
            { status: 500 }
        );
    }
}
