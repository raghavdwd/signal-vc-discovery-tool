import { NextRequest, NextResponse } from "next/server";
import { getGenAI, getModel } from "@/lib/gemini/client";
import { SIMILAR_COMPANIES_SCHEMA } from "@/lib/gemini/schemas";

export const runtime = "edge";

// ============================================================
// POST /api/companies/similar
// Smart similar company matching powered by Gemini
// ============================================================

export async function POST(req: NextRequest) {
    try {
        const { companyDescription, sector, tags, allCompanies, apiKey } = await req.json();

        if (!companyDescription || !allCompanies?.length) {
            return NextResponse.json(
                { error: "companyDescription and allCompanies are required" },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key is required. Please add your key in Settings." },
                { status: 401 }
            );
        }

        // Build a lightweight representation for context efficiency
        const companyList = allCompanies
            .slice(0, 40) // Cap at 40 to stay within token limits
            .map((c: { id: string; name: string; description: string; sector: string; tags?: string[] }) => ({
                id: c.id,
                name: c.name,
                description: c.description?.slice(0, 200),
                sector: c.sector,
                tags: c.tags?.slice(0, 5),
            }));

        const prompt = `Given this target company profile:
- Description: ${companyDescription}
- Sector: ${sector}
- Tags: ${(tags || []).join(", ")}

Analyze these companies and rank the top 5 most similar ones by similarity score (0–100). Consider business model, sector, target market, technology, and stage.

Companies to evaluate:
${JSON.stringify(companyList, null, 2)}

Return the top 5 most similar companies with similarity scores and brief reasoning.`;

        const response = await getGenAI(apiKey).models.generateContent({
            model: getModel("fast"),
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: SIMILAR_COMPANIES_SCHEMA,
                thinkingConfig: {
                    thinkingBudget: 0, // Disable thinking for speed
                },
                temperature: 0.1,
            },
        });

        const text = response.text;
        if (!text) {
            return NextResponse.json(
                { error: "No response from Gemini" },
                { status: 500 }
            );
        }

        const result = JSON.parse(text);

        return NextResponse.json({
            success: true,
            matches: result.matches || [],
        });
    } catch (error: unknown) {
        console.error("Similar companies error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to find similar companies", details: message },
            { status: 500 }
        );
    }
}
