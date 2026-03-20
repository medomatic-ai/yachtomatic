import { useState, useCallback } from "react";
import { FUNCTIONS_URL } from "../lib/supabase";

export interface Rule {
  id: string;
  text: string;
  enabled: boolean;
}

interface MockSession {
  schema: string;
  rules: Rule[];
  apiKey: string;
  sessionId: string | null;
  response: unknown | null;
  rawError: string | null;
  mode: "locked" | "live";
  isGenerating: boolean;
  isLocking: boolean;
}

export function useMockSession() {
  const [state, setState] = useState<MockSession>({
    schema: "",
    rules: [],
    apiKey: "",
    sessionId: null,
    response: null,
    rawError: null,
    mode: "locked",
    isGenerating: false,
    isLocking: false,
  });

  const setSchema = useCallback((schema: string) => {
    setState((s) => ({ ...s, schema }));
  }, []);

  const setApiKey = useCallback((apiKey: string) => {
    setState((s) => ({ ...s, apiKey }));
  }, []);

  const addRule = useCallback((text: string) => {
    setState((s) => ({
      ...s,
      rules: [...s.rules, { id: crypto.randomUUID(), text, enabled: true }],
    }));
  }, []);

  const removeRule = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      rules: s.rules.filter((r) => r.id !== id),
    }));
  }, []);

  const setRules = useCallback((rules: Rule[]) => {
    setState((s) => ({ ...s, rules }));
  }, []);

  const toggleRule = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      rules: s.rules.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  }, []);

  const generate = useCallback(async () => {
    setState((s) => ({ ...s, isGenerating: true, rawError: null }));

    try {
      const activeRules = state.rules
        .filter((r) => r.enabled)
        .map((r) => r.text);

      const res = await fetch(`${FUNCTIONS_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: state.schema,
          rules: activeRules,
          apiKey: state.apiKey,
          sessionId: state.sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((s) => ({
          ...s,
          isGenerating: false,
          rawError: data.error || "Generation failed",
          response: data.raw || null,
        }));
        return;
      }

      setState((s) => ({
        ...s,
        isGenerating: false,
        sessionId: data.sessionId,
        response: data.data,
        mode: "locked",
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        isGenerating: false,
        rawError: err instanceof Error ? err.message : "Network error",
      }));
    }
  }, [state.schema, state.rules, state.apiKey, state.sessionId]);

  const toggleMode = useCallback(async () => {
    if (!state.sessionId) return;

    const newMode = state.mode === "locked" ? "live" : "locked";
    setState((s) => ({ ...s, isLocking: true }));

    try {
      const activeRules = state.rules
        .filter((r) => r.enabled)
        .map((r) => r.text);

      await fetch(`${FUNCTIONS_URL}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          mode: newMode,
          response: newMode === "locked" ? state.response : undefined,
          schema: state.schema,
          rules: activeRules,
        }),
      });

      setState((s) => ({ ...s, mode: newMode, isLocking: false }));
    } catch {
      setState((s) => ({ ...s, isLocking: false }));
    }
  }, [state.sessionId, state.mode, state.response, state.schema, state.rules]);

  const mockEndpointUrl = state.sessionId
    ? `${FUNCTIONS_URL}/mock?session=${state.sessionId}`
    : null;

  return {
    ...state,
    mockEndpointUrl,
    setSchema,
    setApiKey,
    addRule,
    removeRule,
    setRules,
    toggleRule,
    generate,
    toggleMode,
  };
}
