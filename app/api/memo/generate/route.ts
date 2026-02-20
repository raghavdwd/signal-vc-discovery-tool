import { NextRequest, NextResponse } from "next/server";
import { getGenAI, getModel } from "@/lib/gemini/client";
import {
    INVESTMENT_MEMO_SCHEMA,
    type GeminiMemoData,
} from "@/lib/gemini/schemas";

// ============================================================
// POST /api/memo/generate
// Deep investment memo generation using Gemini Pro
// ============================================================

export async function POST(req: NextRequest) {
    try {
        const { companyData, enrichmentData, apiKey } = await req.json();

        if (!companyData) {
            return NextResponse.json(
                { error: "companyData is required" },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key is required. Please add your key in Settings." },
                { status: 401 }
            );
        }

        const prompt = `Generate a professional investment memo for the following startup. This memo should be suitable for an Investment Committee (IC) review at a top-tier VC fund.

COMPANY DATA:
${JSON.stringify(companyData, null, 2)}

${enrichmentData ? `AI ENRICHMENT ANALYSIS:\n${JSON.stringify(enrichmentData, null, 2)}` : ""}

Write a thorough but concise investment memo. Include specific data points where available, and clearly flag where assumptions are being made. Be rigorous in your analysis — an IC depends on the accuracy and objectivity of this memo.`;

        const response = await getGenAI(apiKey).models.generateContent({
            model: getModel("deep"),
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: INVESTMENT_MEMO_SCHEMA,
                thinkingConfig: {
                    thinkingBudget: 8192,
                },
                temperature: 0.3,
            },
        });

        const text = response.text;
        if (!text) {
            return NextResponse.json(
                { error: "No response from Gemini" },
                { status: 500 }
            );
        }

        const memo: GeminiMemoData = JSON.parse(text);

        return NextResponse.json({
            success: true,
            memo,
            generatedAt: new Date().toISOString(),
            model: getModel("deep"),
        });
    } catch (error: unknown) {
        console.error("Memo generation error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to generate memo", details: message },
            { status: 500 }
        );
    }
}
