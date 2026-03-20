import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // GET — list all saved schemas
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("saved_schemas")
      .select("id, name, schema, rules, api_key, slug, locked_response, created_at, updated_at")
      .order("name");

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // POST — save or update a schema
  if (req.method === "POST") {
    try {
      const { name, schema, rules, apiKey, slug, lockedResponse } = await req.json();

      if (!name || !schema) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: name, schema" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("saved_schemas")
        .upsert(
          {
            name,
            schema,
            rules: rules || [],
            api_key: apiKey || null,
            slug: slug || null,
            locked_response: lockedResponse || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "name" }
        )
        .select("id, name")
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: true, ...data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Unexpected error: ${err.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // DELETE — delete a schema by name
  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Missing name parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase
      .from("saved_schemas")
      .delete()
      .eq("name", name);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
