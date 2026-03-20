import { useState, useEffect, useCallback } from "react";
import { FUNCTIONS_URL } from "../lib/supabase";
import type { Rule } from "../hooks/useMockSession";

interface SavedSchema {
  id: string;
  name: string;
  schema: string;
  rules: string[];
  api_key: string | null;
}

interface SchemaPresetsProps {
  currentSchema: string;
  currentRules: Rule[];
  currentApiKey: string;
  onLoad: (schema: string, rules: Rule[], apiKey: string) => void;
}

export function SchemaPresets({
  currentSchema,
  currentRules,
  currentApiKey,
  onLoad,
}: SchemaPresetsProps) {
  const [presets, setPresets] = useState<SavedSchema[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleLoad = () => {
    const preset = presets.find((p) => p.name === selectedName);
    if (!preset) return;

    const rules: Rule[] = preset.rules.map((text) => ({
      id: crypto.randomUUID(),
      text,
      enabled: true,
    }));

    onLoad(preset.schema, rules, preset.api_key || currentApiKey);
    showMsg(`Loaded "${preset.name}"`);
  };

  const handleSave = async () => {
    const name = newName.trim();
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
        }),
      });

      if (res.ok) {
        await fetchPresets();
        setNewName("");
        setShowSaveInput(false);
        setSelectedName(name);
        showMsg(`Saved "${name}"`);
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

  const showMsg = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2000);
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
              {p.name}
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

      {!showSaveInput ? (
        <button
          onClick={() => setShowSaveInput(true)}
          disabled={!currentSchema.trim()}
          title="Save the current schema, rules, and API key as a preset"
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-xs text-gray-100 rounded-lg transition-colors"
        >
          Save Current Schema As...
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Schema name (e.g. Task System)"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSave}
            disabled={!newName.trim() || isSaving}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-xs text-white rounded-lg transition-colors"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => { setShowSaveInput(false); setNewName(""); }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs text-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {message && (
        <p className="text-xs text-green-400 text-center">{message}</p>
      )}
    </div>
  );
}
