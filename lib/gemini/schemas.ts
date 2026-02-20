// ============================================================
// Gemini Structured Output Schemas & TypeScript Types
// ============================================================

// -------------------- Enrichment --------------------

export interface GeminiEnrichmentData {
    executive_summary: string;
    confidence_score: number;
    what_they_do: string[];
    target_market: string;
    business_model: string;
    competitive_moat: "High" | "Medium" | "Low";
    team_quality: "Exceptional" | "Strong" | "Average" | "Unknown";
    funding_readiness: string;
    growth_signals: string[];
    risk_factors: string[];
    tech_stack: string[];
    keywords: string[];
    recommended_actions: string[];
}

export const COMPANY_ENRICHMENT_SCHEMA = {
    type: "object" as const,
    properties: {
        executive_summary: { type: "string" as const, description: "2-3 sentence executive summary of the company" },
        confidence_score: { type: "number" as const, description: "Confidence score 0-100 based on available information" },
        what_they_do: { type: "array" as const, items: { type: "string" as const }, description: "3-5 bullet points describing what the company does" },
        target_market: { type: "string" as const, description: "Description of the target market" },
        business_model: { type: "string" as const, description: "Primary business model (e.g. SaaS, Marketplace, etc.)" },
        competitive_moat: { type: "string" as const, enum: ["High", "Medium", "Low"], description: "Strength of competitive moat" },
        team_quality: { type: "string" as const, enum: ["Exceptional", "Strong", "Average", "Unknown"], description: "Assessment of team quality" },
        funding_readiness: { type: "string" as const, description: "Assessment of funding readiness" },
        growth_signals: { type: "array" as const, items: { type: "string" as const }, description: "Positive growth signals" },
        risk_factors: { type: "array" as const, items: { type: "string" as const }, description: "Key risk factors" },
        tech_stack: { type: "array" as const, items: { type: "string" as const }, description: "Identified technologies" },
        keywords: { type: "array" as const, items: { type: "string" as const }, description: "Relevant keywords/tags" },
        recommended_actions: { type: "array" as const, items: { type: "string" as const }, description: "Recommended next steps for the VC" },
    },
    required: [
        "executive_summary", "confidence_score", "what_they_do", "target_market",
        "business_model", "competitive_moat", "team_quality", "funding_readiness",
        "growth_signals", "risk_factors", "tech_stack", "keywords", "recommended_actions",
    ],
};

// -------------------- Investment Memo --------------------

export interface GeminiMemoData {
    investment_thesis: string;
    market_opportunity: {
        tam: string;
        sam: string;
        som: string;
        growth_rate: string;
        key_trends: string[];
    };
    product_analysis: {
        description: string;
        key_features: string[];
        differentiation: string;
    };
    competitive_landscape: {
        competitor: string;
        threat_level: "High" | "Medium" | "Low";
        strength: string;
        weakness: string;
    }[];
    risk_assessment: {
        category: string;
        severity: "High" | "Medium" | "Low";
        description: string;
        mitigation: string;
    }[];
    recommendation: {
        decision: "Invest" | "Pass" | "Monitor";
        conviction: number;
        rationale: string;
        next_steps: string[];
        suggested_terms?: string;
    };
}

export const INVESTMENT_MEMO_SCHEMA = {
    type: "object" as const,
    properties: {
        investment_thesis: { type: "string" as const, description: "Core investment thesis" },
        market_opportunity: {
            type: "object" as const,
            properties: {
                tam: { type: "string" as const, description: "Total Addressable Market" },
                sam: { type: "string" as const, description: "Serviceable Addressable Market" },
                som: { type: "string" as const, description: "Serviceable Obtainable Market" },
                growth_rate: { type: "string" as const, description: "Market growth rate" },
                key_trends: { type: "array" as const, items: { type: "string" as const }, description: "Key market trends" },
            },
            required: ["tam", "sam", "som", "growth_rate", "key_trends"],
        },
        product_analysis: {
            type: "object" as const,
            properties: {
                description: { type: "string" as const, description: "Product description" },
                key_features: { type: "array" as const, items: { type: "string" as const }, description: "Key product features" },
                differentiation: { type: "string" as const, description: "How the product is differentiated" },
            },
            required: ["description", "key_features", "differentiation"],
        },
        competitive_landscape: {
            type: "array" as const,
            items: {
                type: "object" as const,
                properties: {
                    competitor: { type: "string" as const },
                    threat_level: { type: "string" as const, enum: ["High", "Medium", "Low"] },
                    strength: { type: "string" as const },
                    weakness: { type: "string" as const },
                },
                required: ["competitor", "threat_level", "strength", "weakness"],
            },
        },
        risk_assessment: {
            type: "array" as const,
            items: {
                type: "object" as const,
                properties: {
                    category: { type: "string" as const },
                    severity: { type: "string" as const, enum: ["High", "Medium", "Low"] },
                    description: { type: "string" as const },
                    mitigation: { type: "string" as const },
                },
                required: ["category", "severity", "description", "mitigation"],
            },
        },
        recommendation: {
            type: "object" as const,
            properties: {
                decision: { type: "string" as const, enum: ["Invest", "Pass", "Monitor"] },
                conviction: { type: "number" as const, description: "Conviction score 1-10" },
                rationale: { type: "string" as const },
                next_steps: { type: "array" as const, items: { type: "string" as const } },
                suggested_terms: { type: "string" as const, description: "Optional suggested deal terms" },
            },
            required: ["decision", "conviction", "rationale", "next_steps"],
        },
    },
    required: [
        "investment_thesis", "market_opportunity", "product_analysis",
        "competitive_landscape", "risk_assessment", "recommendation",
    ],
};

// -------------------- Similar Companies --------------------

export const SIMILAR_COMPANIES_SCHEMA = {
    type: "object" as const,
    properties: {
        matches: {
            type: "array" as const,
            items: {
                type: "object" as const,
                properties: {
                    id: { type: "string" as const, description: "Company ID from the provided list" },
                    similarity_score: { type: "number" as const, description: "Similarity score 0-100" },
                    reason: { type: "string" as const, description: "Brief explanation of similarity" },
                },
                required: ["id", "similarity_score", "reason"],
            },
        },
    },
    required: ["matches"],
};
