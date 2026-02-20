import { GoogleGenAI } from "@google/genai";

// ============================================================
// Gemini AI Client — uses the NEW @google/genai SDK
// Creates a fresh client per-request using the user-supplied key.
// ============================================================

/**
 * Returns a GoogleGenAI client using the provided API key.
 * The key comes from the client-side request (stored in localStorage).
 */
export function getGenAI(apiKey: string): GoogleGenAI {
    if (!apiKey) {
        throw new Error(
            "Gemini API key is required. Please add your key in Settings."
        );
    }
    return new GoogleGenAI({ apiKey });
}

/**
 * Model selection helper — picks the right model for the task.
 *  fast      → gemini-2.5-flash-lite  (lowest latency)
 *  balanced  → gemini-2.5-flash       (good quality/speed ratio)
 *  deep      → gemini-2.5-pro         (highest quality, slower)
 */
export function getModel(type: "fast" | "balanced" | "deep" = "balanced") {
    switch (type) {
        case "fast":
            return process.env.GEMINI_MODEL_FLASH_LITE || "gemini-2.5-flash-lite";
        case "deep":
            return process.env.GEMINI_MODEL_PRO || "gemini-2.5-pro";
        default:
            return process.env.GEMINI_MODEL_FLASH || "gemini-2.5-flash";
    }
}
