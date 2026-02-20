import { NextRequest, NextResponse } from "next/server";
import { getGenAI, getModel } from "@/lib/gemini/client";

// ============================================================
// POST /api/chat/company
// Chat with company data — RAG-style Q&A with Gemini
// ============================================================

export async function POST(req: NextRequest) {
    try {
        const { message, companyContext, history = [], apiKey } = await req.json();

        if (!message) {
            return NextResponse.json(
                { error: "message is required" },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key is required. Please add your key in Settings." },
                { status: 401 }
            );
        }

        const systemPrompt = `You are a VC analyst assistant named "Signal AI". You have access to the following company data:

${JSON.stringify(companyContext, null, 2)}

Rules:
- Answer questions accurately based on this data
- If you don't know something, say so clearly
- Be concise and professional
- Use VC terminology appropriately
- Format responses with markdown when helpful
- Provide actionable insights when possible`;

        // Build multi-turn conversation
        const contents = [
            {
                role: "user" as const,
                parts: [{ text: systemPrompt }],
            },
            {
                role: "model" as const,
                parts: [{ text: "I'm ready to help you analyze this company. What would you like to know?" }],
            },
            ...history.map((h: { role: "user" | "model"; content: string }) => ({
                role: h.role as "user" | "model",
                parts: [{ text: h.content }],
            })),
            {
                role: "user" as const,
                parts: [{ text: message }],
            },
        ];

        const response = await getGenAI(apiKey).models.generateContent({
            model: getModel("balanced"),
            contents,
            config: {
                thinkingConfig: {
                    thinkingBudget: 1024,
                },
                temperature: 0.4,
            },
        });

        const text = response.text;

        return NextResponse.json({
            success: true,
            response: text || "I couldn't generate a response. Please try again.",
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        console.error("Chat error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Chat failed", details: message },
            { status: 500 }
        );
    }
}
