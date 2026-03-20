import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { schema, rules, apiKey, sessionId } = await req.json();

    if (!schema || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: schema, apiKey" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      if (typeof schema === "string") JSON.parse(schema);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid schema: not valid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rulesText = (rules || []).length > 0
      ? `\n\nAdditional rules:\n${rules.map((r: string) => `- ${r}`).join("\n")}`
      : "";

    const prompt = `Generate realistic sample data that matches this exact JSON structure. Return ONLY valid JSON, no markdown, no explanation.

JSON structure:
${typeof schema === "string" ? schema : JSON.stringify(schema, null, 2)}${rulesText}`;

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (claudeResponse.status === 401) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (claudeResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limited. Try again shortly." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!claudeResponse.ok) {
      const errBody = await claudeResponse.text();
      return new Response(
        JSON.stringify({ error: `Generation failed: ${errBody}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData.content[0].text;

    let generatedData;
    try {
      generatedData = JSON.parse(rawText);
    } catch {
      return new Response(
        JSON.stringify({ error: "Claude returned invalid JSON", raw: rawText }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const schemaJson = typeof schema === "string" ? JSON.parse(schema) : schema;

    let finalSessionId = sessionId;

    if (sessionId) {
      await supabase
        .from("mock_sessions")
        .update({
          schema: schemaJson,
          rules: rules || [],
          locked_response: generatedData,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        })
        .eq("id", sessionId);
    } else {
      const { data, error } = await supabase
        .from("mock_sessions")
        .insert({
          schema: schemaJson,
          rules: rules || [],
          locked_response: generatedData,
          mode: "locked",
        })
        .select("id")
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: `Session creation failed: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      finalSessionId = data.id;
    }

    return new Response(
      JSON.stringify({ sessionId: finalSessionId, data: generatedData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
