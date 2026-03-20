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

  // Extract the slug from the URL path
  // URL will be like: /functions/v1/api/tasks or /functions/v1/api/messages
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  // Find "api" in path and take everything after it as the slug
  const apiIndex = pathParts.indexOf("api");
  const slug = pathParts.slice(apiIndex + 1).filter(Boolean).join("/");

  if (!slug) {
    return new Response(
      JSON.stringify({
        error: "Missing endpoint path. Use /api/your-endpoint-name",
        hint: "Each saved schema has a custom endpoint slug. Check the Yachtomatic UI for your endpoint URLs.",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: schema, error } = await supabase
    .from("saved_schemas")
    .select("name, slug, locked_response, schema, rules")
    .eq("slug", slug)
    .single();

  if (error || !schema) {
    return new Response(
      JSON.stringify({
        error: `No endpoint found for path "/${slug}"`,
        hint: "Make sure this endpoint has been set up in the Yachtomatic UI with a locked response.",
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!schema.locked_response) {
    return new Response(
      JSON.stringify({
        error: `Endpoint "/${slug}" exists but has no locked response. Generate a response in the Yachtomatic UI first.`,
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify(schema.locked_response),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
