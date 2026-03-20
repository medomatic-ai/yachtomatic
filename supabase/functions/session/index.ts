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
    const { sessionId, mode, response, schema, rules } = await req.json();

    if (!sessionId || !mode) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: sessionId, mode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (mode !== "locked" && mode !== "live") {
      return new Response(
        JSON.stringify({ error: "Mode must be 'locked' or 'live'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const updateData: Record<string, unknown> = {
      mode,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    if (mode === "locked" && response) {
      updateData.locked_response = response;
    }

    if (mode === "live") {
      updateData.locked_response = null;
    }

    if (schema) {
      updateData.schema = typeof schema === "string" ? JSON.parse(schema) : schema;
    }

    if (rules) {
      updateData.rules = rules;
    }

    const { error } = await supabase
      .from("mock_sessions")
      .update(updateData)
      .eq("id", sessionId);

    if (error) {
      return new Response(
        JSON.stringify({ error: `Session update failed: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, mode }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
