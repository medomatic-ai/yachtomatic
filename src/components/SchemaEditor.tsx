import { useState } from "react";

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SchemaEditor({ value, onChange }: SchemaEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    onChange(code);
    if (code.trim() === "") {
      setError(null);
      return;
    }
    try {
      JSON.parse(code);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">
        Output Structure (JSON)
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste your JSON structure here..."
        spellCheck={false}
        className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono min-h-[200px] resize-y"
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
