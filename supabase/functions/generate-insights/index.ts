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
    const { kpis } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a financial analyst specialized in SaaS metrics. 
Generate 3-4 concise, actionable insights based on the provided KPI data.
Each insight should be specific, data-driven, and provide clear recommendations.
Format each insight as a short paragraph (2-3 sentences max).
Do not use markdown formatting like ** or __. Write in plain text only.`;

    const userPrompt = `Analyze these SaaS KPIs and provide insights:

MRR: $${kpis.mrr.toLocaleString()} (${kpis.mrrChange > 0 ? '+' : ''}${kpis.mrrChange.toFixed(1)}% MoM)
CAC: $${kpis.cac.toFixed(2)} (${kpis.cacChange > 0 ? '+' : ''}${kpis.cacChange.toFixed(1)}% MoM)
Churn Rate: ${kpis.churnRate.toFixed(1)}% (${kpis.churnChange > 0 ? '+' : ''}${kpis.churnChange.toFixed(1)}% MoM)
Burn Rate: $${kpis.burnRate.toLocaleString()} (${kpis.burnRateChange > 0 ? '+' : ''}${kpis.burnRateChange.toFixed(1)}% MoM)
Runway: ${kpis.runwayMonths.toFixed(1)} months
LTV/CAC Ratio: ${kpis.ltvCacRatio.toFixed(2)} (${kpis.ltvCacChange > 0 ? '+' : ''}${kpis.ltvCacChange.toFixed(1)}% MoM)
ARPU: $${kpis.arpu.toFixed(2)} (${kpis.arpuChange > 0 ? '+' : ''}${kpis.arpuChange.toFixed(1)}% MoM)

Generate insights focusing on:
1. Growth trajectory and revenue health
2. Customer acquisition efficiency
3. Runway and burn management
4. Overall business health and recommendations`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate insights" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const insights = data.choices[0]?.message?.content || "Unable to generate insights at this time.";

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
