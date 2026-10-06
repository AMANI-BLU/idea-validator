export interface Product {
  name: string;
  description: string;
  website: string;
  similarity: "high" | "medium" | "low";
  differentiator: string;
}

export interface ValidationResult {
  products: Product[];
  summary: string;
  opportunity: {
    status: "yes" | "maybe" | "no";
    reason: string;
  };
  isDemo?: boolean;
}

const STORAGE_KEY = "idea_validator_gemini_api_key";
const DEMO_MODE_KEY = "idea_validator_demo_mode";

export function getGeminiApiKey(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim().length > 0) {
    return stored.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return "";
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (!key || key.trim() === "") {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

export function isDemoModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function setDemoModeEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_MODE_KEY, enabled ? "true" : "false");
}

export async function validateIdea(idea: string): Promise<ValidationResult> {
  const trimmed = idea.trim();
  if (trimmed.length < 3) {
    throw new Error("Please provide a valid idea with at least 3 characters.");
  }

  const apiKey = getGeminiApiKey();
  const demoMode = isDemoModeEnabled();

  // If no API key is set or demo mode is explicitly enabled, return intelligent demo analysis
  if (!apiKey || demoMode) {
    return generateDemoResult(trimmed);
  }

  // Attempt Google Gemini call
  return await callGeminiAPI(trimmed, apiKey);
}

async function callGeminiAPI(idea: string, apiKey: string): Promise<ValidationResult> {
  const systemPrompt = `You are an expert startup researcher and product analyst. When given a startup idea, you research and identify existing products, apps, or services that are similar or solve the same problem.
Your task is to analyze the given idea and return a JSON response with similar existing products.

IMPORTANT: Return ONLY real, existing products with accurate information. Do not hallucinate fake products.
The output MUST be a valid JSON object matching this schema:
{
  "summary": "A brief analysis of the competitive landscape (2-3 sentences)",
  "opportunity": {
    "status": "yes" | "maybe" | "no",
    "reason": "Why or why not there is still opportunity to build this"
  },
  "products": [
    {
      "name": "Product or company name",
      "description": "A brief 1-2 sentence description of what it does",
      "website": "Actual working website URL (e.g. https://example.com)",
      "similarity": "high" | "medium" | "low",
      "differentiator": "What makes this product unique or different from the proposed idea"
    }
  ]
}
If no similar products exist, products should be an empty array [].`;

  const CANDIDATE_MODELS = [
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-3.8-flash"
  ];

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `Startup Idea to analyze: "${idea}"\n\nAnalyze this startup idea, find similar existing competitors/products, and return the structured JSON result.` }
        ]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3
    }
  };

  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let message = `AI service returned error ${response.status}`;
        try {
          const parsed = JSON.parse(errorBody);
          if (parsed.error?.message) {
            message = parsed.error.message;
          }
        } catch {
          // ignore
        }

        // If unauthorized or forbidden, don't retry other models, key is invalid
        if (response.status === 400 || response.status === 403) {
          throw new Error(`Gemini API Error: ${message}. Please check your API key.`);
        }

        // If 404 (model not found/deprecated) or 503 (temporarily busy), try next model
        console.warn(`Gemini model ${model} failed with ${response.status}: ${message}. Trying fallback...`);
        lastError = new Error(message);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("No response received from Gemini.");
      }

      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned) as ValidationResult;
      return {
        products: Array.isArray(parsed.products) ? parsed.products : [],
        summary: parsed.summary || "Competitive analysis completed.",
        opportunity: {
          status: parsed.opportunity?.status || "maybe",
          reason: parsed.opportunity?.reason || "Evaluation completed."
        },
        isDemo: false
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes("API key")) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Failed to reach Gemini AI service. Please check your network and try again.");
}

function generateDemoResult(idea: string): ValidationResult {
  const lower = idea.toLowerCase();

  if (lower.includes("pet") || lower.includes("dog") || lower.includes("cat")) {
    return {
      isDemo: true,
      summary: "The pet tech and services market is established but experiencing steady innovation in subscription-based care and biometric monitoring.",
      opportunity: {
        status: "maybe",
        reason: "While major players exist for general pet care, specialized niche offerings with superior community features or automated health tracking still have strong potential."
      },
      products: [
        {
          name: "Rover",
          description: "Leading marketplace connecting pet parents with neighborhood pet sitters, dog walkers, and boarding facilities.",
          website: "https://www.rover.com",
          similarity: "medium",
          differentiator: "Focuses purely on local human sitter matching rather than hardware or health diagnostic automation."
        },
        {
          name: "Fi Smart Collar",
          description: "GPS tracking and health monitoring smart collar for dogs with LTE connectivity.",
          website: "https://tryfi.com",
          similarity: "medium",
          differentiator: "Hardware-centric wearable tracking physical activity and location escapes."
        },
        {
          name: "BarkBox",
          description: "Monthly themed subscription service delivering toys, treats, and pet lifestyle accessories.",
          website: "https://www.barkbox.com",
          similarity: "low",
          differentiator: "Content and physical e-commerce subscription box model."
        }
      ]
    };
  }

  if (lower.includes("invoice") || lower.includes("freelanc") || lower.includes("finance") || lower.includes("tax")) {
    return {
      isDemo: true,
      summary: "Freelance finance and automated invoicing is a competitive space dominated by established accounting suites and vertical neobanks.",
      opportunity: {
        status: "maybe",
        reason: "You need a distinctive angle—such as AI automated contract-to-escrow, instant crypto/cross-border settlement, or integrated tax dispute resolution."
      },
      products: [
        {
          name: "Bonsai",
          description: "All-in-one product suite for freelance business operations including contracts, time tracking, and invoicing.",
          website: "https://www.hellobonsai.com",
          similarity: "high",
          differentiator: "Broader suite covering legal documents and client CRM rather than specialized micro-invoicing."
        },
        {
          name: "FreshBooks",
          description: "Cloud-based accounting software built specifically for small businesses and self-employed professionals.",
          website: "https://www.freshbooks.com",
          similarity: "medium",
          differentiator: "Traditional accounting and double-entry bookkeeping capabilities for teams."
        },
        {
          name: "Contra",
          description: "Commission-free freelance portfolio and payment network.",
          website: "https://contra.com",
          similarity: "medium",
          differentiator: "Social portfolio and community-driven marketplace approach."
        }
      ]
    };
  }

  // Default intelligent demo analysis
  return {
    isDemo: true,
    summary: `The space surrounding "${idea.slice(0, 45)}..." features several active players addressing adjacent workflows, with emerging room for specialized AI workflow automation.`,
    opportunity: {
      status: "yes",
      reason: "Existing competitors focus largely on generic enterprise workflows; a tailored solution focusing on speed, seamless UX, and specific underserved niches can capture market share."
    },
    products: [
      {
        name: "Notion",
        description: "Customizable connected workspace for documentation, notes, and task management.",
        website: "https://www.notion.so",
        similarity: "medium",
        differentiator: "Broad horizontal platform requiring manual workspace configuration rather than tailored turnkey workflows."
      },
      {
        name: "Product Hunt",
        description: "Community platform for launching and discovering next-generation digital products and software.",
        website: "https://www.producthunt.com",
        similarity: "low",
        differentiator: "Discovery and social launch pad rather than a dedicated domain-specific solution."
      },
      {
        name: "Zapier",
        description: "Automation platform connecting thousands of web apps and automating repetitive cross-tool tasks.",
        website: "https://zapier.com",
        similarity: "medium",
        differentiator: "General-purpose integration hub without vertical-specific intelligence."
      }
    ]
  };
}
