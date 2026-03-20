import type { Rule } from "../hooks/useMockSession";

interface RulesListProps {
  rules: Rule[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function RulesList({ rules, onToggle, onRemove }: RulesListProps) {
  if (rules.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">Active Rules</label>
      <div className="flex flex-col gap-1">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
          >
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={() => onToggle(rule.id)}
              className="accent-blue-500"
            />
            <span
              className={`flex-1 text-sm ${
                rule.enabled ? "text-gray-100" : "text-gray-500 line-through"
              }`}
            >
              {rule.text}
            </span>
            <button
              onClick={() => onRemove(rule.id)}
              className="text-gray-500 hover:text-red-400 text-sm transition-colors"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
