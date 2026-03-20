import { useState } from "react";

interface PromptInputProps {
  onAddRule: (text: string) => void;
}

export function PromptInput({ onAddRule }: PromptInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAddRule(trimmed);
    setValue("");
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">
        Instructions / Rules
      </label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={"Add rules that control how the mock response is generated.\n\nExamples:\n- Keep item_id and conversation_id the same across regenerations\n- Use realistic UUIDs for all ID fields\n- Link keywords should relate to boat systems (electrical, engine, hull)\n- Always include at least one create_task action"}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[120px] resize-y"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="w-full py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-sm text-gray-100 rounded-lg transition-colors"
      >
        + Add Rule
      </button>
    </div>
  );
}
