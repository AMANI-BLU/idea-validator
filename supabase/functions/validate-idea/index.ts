import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();

    if (!idea || typeof idea !== "string" || idea.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid idea (at least 3 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert startup researcher and product analyst. When given a startup idea, you research and identify existing products, apps, or services that are similar or solve the same problem.

Your task is to analyze the given idea and return a structured response with similar existing products.

IMPORTANT: Return ONLY real, existing products with accurate information. Do not make up products.

For each similar product found, provide:
- name: The product/company name
- description: A brief 1-2 sentence description of what it does
- website: The actual website URL (must be a real, working URL)
- similarity: How similar it is to the idea (high/medium/low)
- differentiator: What makes this product unique or different from the proposed idea

If you cannot find any similar products, return an empty array for "products".

Also provide:
- summary: A brief analysis of the competitive landscape (2-3 sentences)
- opportunity: Whether there's still an opportunity to build this (yes/maybe/no) and why`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this startup idea and find similar existing products: "${idea}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_similar_products",
              description: "Report the analysis of similar products found",
              parameters: {
                type: "object",
                properties: {
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Product/company name" },
                        description: { type: "string", description: "Brief description of what it does" },
                        website: { type: "string", description: "Website URL" },
                        similarity: { 
                          type: "string", 
                          enum: ["high", "medium", "low"],
                          description: "How similar to the proposed idea"
                        },
                        differentiator: { type: "string", description: "What makes this unique" },
                      },
                      required: ["name", "description", "website", "similarity", "differentiator"],
                    },
                  },
                  summary: { 
                    type: "string", 
                    description: "Brief analysis of the competitive landscape" 
                  },
                  opportunity: {
                    type: "object",
                    properties: {
                      status: { 
                        type: "string", 
                        enum: ["yes", "maybe", "no"],
                        description: "Is there still opportunity to build this?"
                      },
                      reason: { type: "string", description: "Why or why not" },
                    },
                    required: ["status", "reason"],
                  },
                },
                required: ["products", "summary", "opportunity"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_similar_products" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze idea" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "report_similar_products") {
      console.error("Unexpected response format:", data);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in validate-idea:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
