import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session");

  if (!sessionId) {
    return new Response(
      JSON.stringify({ error: "Missing session parameter" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: session, error } = await supabase
    .from("mock_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    return new Response(
      JSON.stringify({ error: "No mock configured. Use the UI to set up a schema." }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (new Date(session.expires_at) < new Date()) {
    return new Response(
      JSON.stringify({ error: "Session expired. Generate a new mock in the UI." }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (session.mode === "locked") {
    return new Response(
      JSON.stringify(session.locked_response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Live mode
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Live mode requires X-Api-Key header with your Anthropic API key" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Rate limiting: 10 requests per minute per session
  const now = new Date();
  const resetTime = new Date(session.rate_limit_reset);
  let requestCount = session.request_count;

  if (now > resetTime) {
    requestCount = 0;
    await supabase
      .from("mock_sessions")
      .update({
        request_count: 1,
        rate_limit_reset: new Date(now.getTime() + 60 * 1000).toISOString(),
      })
      .eq("id", sessionId);
  } else if (requestCount >= 10) {
    return new Response(
      JSON.stringify({ error: "Rate limited. Max 10 requests per minute in live mode." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } else {
    await supabase
      .from("mock_sessions")
      .update({ request_count: requestCount + 1 })
      .eq("id", sessionId);
  }

  const rulesText = (session.rules || []).length > 0
    ? `\n\nAdditional rules:\n${session.rules.map((r: string) => `- ${r}`).join("\n")}`
    : "";

  const prompt = `Generate realistic sample data that matches this exact JSON structure. Return ONLY valid JSON, no markdown, no explanation.

JSON structure:
${JSON.stringify(session.schema, null, 2)}${rulesText}`;

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

  if (!claudeResponse.ok) {
    const status = claudeResponse.status;
    if (status === 401) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limited. Try again shortly." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Generation failed" }),
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

  return new Response(
    JSON.stringify(generatedData),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
