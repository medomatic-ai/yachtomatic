import { useState, useEffect, useCallback } from "react";
import { FUNCTIONS_URL } from "../lib/supabase";
import type { Rule } from "../hooks/useMockSession";

interface SavedSchema {
  id: string;
  name: string;
  schema: string;
  rules: string[];
  api_key: string | null;
  slug: string | null;
  locked_response: unknown | null;
}

interface SchemaPresetsProps {
  currentSchema: string;
  currentRules: Rule[];
  currentApiKey: string;
  currentResponse: unknown | null;
  onLoad: (schema: string, rules: Rule[], apiKey: string) => void;
}

export function SchemaPresets({
  currentSchema,
  currentRules,
  currentApiKey,
  currentResponse,
  onLoad,
}: SchemaPresetsProps) {
  const [presets, setPresets] = useState<SavedSchema[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fetchPresets = useCallback(async () => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/schemas`);
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
      }
    } catch {
      // silent fail on load
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const selectedPreset = presets.find((p) => p.name === selectedName);
  const endpointUrl = selectedPreset?.slug
    ? `${FUNCTIONS_URL}/api/${selectedPreset.slug}`
    : null;

  const handleLoad = () => {
    if (!selectedPreset) return;

    const rules: Rule[] = selectedPreset.rules.map((text) => ({
      id: crypto.randomUUID(),
      text,
      enabled: true,
    }));

    onLoad(selectedPreset.schema, rules, selectedPreset.api_key || currentApiKey);
    showMsg(`Loaded "${selectedPreset.name}"`);
  };

  const handleSave = async () => {
    const name = newName.trim();
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-/]/g, "");
    if (!name || !currentSchema.trim()) return;

    setIsSaving(true);
    try {
      const activeRules = currentRules
        .filter((r) => r.enabled)
        .map((r) => r.text);

      const res = await fetch(`${FUNCTIONS_URL}/schemas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          schema: currentSchema,
          rules: activeRules,
          apiKey: currentApiKey,
          slug: slug || null,
          lockedResponse: currentResponse,
        }),
      });

      if (res.ok) {
        await fetchPresets();
        setNewName("");
        setNewSlug("");
        setShowSaveInput(false);
        setSelectedName(name);
        showMsg(`Saved "${name}"`);
      } else {
        const data = await res.json();
        showMsg(data.error || "Failed to save");
      }
    } catch {
      showMsg("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedName) return;
    if (!confirm(`Delete "${selectedName}"?`)) return;

    try {
      const res = await fetch(
        `${FUNCTIONS_URL}/schemas?name=${encodeURIComponent(selectedName)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setSelectedName("");
        await fetchPresets();
        showMsg("Deleted");
      }
    } catch {
      showMsg("Failed to delete");
    }
  };

  const handleCopyUrl = async () => {
    if (!endpointUrl) return;
    await navigator.clipboard.writeText(endpointUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const showMsg = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">Saved Schemas</label>
      <div className="flex gap-2">
        <select
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="">Select a saved schema...</option>
          {presets.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}{p.slug ? ` (/api/${p.slug})` : ""}
            </option>
          ))}
        </select>
        <button
          onClick={handleLoad}
          disabled={!selectedName}
          title="Load the selected schema, rules, and API key"
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-xs text-gray-100 rounded-lg transition-colors"
        >
          Load
        </button>
        <button
          onClick={handleDelete}
          disabled={!selectedName}
          title="Delete the selected schema"
          className="px-3 py-2 bg-gray-700 hover:bg-red-900 disabled:bg-gray-800 disabled:text-gray-600 text-xs text-gray-100 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>

      {endpointUrl && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-300">
              Custom Endpoint for "{selectedPreset?.name}"
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              selectedPreset?.locked_response
                ? "bg-green-900 text-green-300"
                : "bg-red-900 text-red-300"
            }`}>
              {selectedPreset?.locked_response ? "Has Response" : "No Response"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-800 rounded px-3 py-2 text-blue-300 truncate">
              {endpointUrl}
            </code>
            <button
              onClick={handleCopyUrl}
              title="Copy the custom endpoint URL"
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs text-gray-100 rounded transition-colors shrink-0"
            >
              {copiedUrl ? "Copied!" : "Copy"}
            </button>
          </div>
          {!selectedPreset?.locked_response && (
            <p className="text-xs text-amber-400">
              Generate a response and re-save this schema to activate the endpoint.
            </p>
          )}
        </div>
      )}

      {!showSaveInput ? (
        <button
          onClick={() => {
            setShowSaveInput(true);
            // Auto-suggest a slug from the schema name
            setNewSlug("");
          }}
          disabled={!currentSchema.trim()}
          title="Save the current schema, rules, API key, and response as a preset with a custom endpoint"
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-xs text-gray-100 rounded-lg transition-colors"
        >
          Save Current Schema As...
        </button>
      ) : (
        <div className="flex flex-col gap-2 bg-gray-900 border border-gray-700 rounded-lg p-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              // Auto-generate slug from name
              if (!newSlug || newSlug === slugify(newName)) {
                setNewSlug(slugify(e.target.value));
              }
            }}
            placeholder="Schema name (e.g. Task System)"
            autoFocus
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 shrink-0">/api/</span>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, ""))}
              placeholder="endpoint-path"
              title="Custom URL path for this schema's endpoint (e.g. tasks, messages, notifications)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          {newSlug && (
            <p className="text-xs text-gray-500">
              Endpoint: <code className="text-blue-300">{FUNCTIONS_URL}/api/{newSlug}</code>
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!newName.trim() || isSaving}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-xs text-white rounded-lg transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => { setShowSaveInput(false); setNewName(""); setNewSlug(""); }}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs text-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="text-xs text-green-400 text-center">{message}</p>
      )}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
