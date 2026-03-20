import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";
import { useState } from "react";

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SchemaEditor({ value, onChange }: SchemaEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (code: string) => {
    onChange(code);
    if (code.trim() === "") {
      setError(null);
      return;
    }
    try {
      JSON.parse(code);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">
        Output Structure (JSON)
      </label>
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
        <Editor
          value={value}
          onValueChange={handleChange}
          highlight={(code) => highlight(code, languages.json, "json")}
          padding={16}
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 13,
            minHeight: 200,
            color: "#e4e4e7",
          }}
          placeholder='Paste your JSON structure here...'
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
