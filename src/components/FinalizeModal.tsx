import { useState } from "react";
import type { Rule } from "../hooks/useMockSession";

interface FinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: string;
  rules: Rule[];
  endpointUrl: string;
}

export function FinalizeModal({
  isOpen,
  onClose,
  schema,
  rules,
  endpointUrl,
}: FinalizeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeRules = rules.filter((r) => r.enabled);

  const message = `Finalized Schema for Yachtomatic

Output Structure:
${schema}
${
  activeRules.length > 0
    ? `\nRules:\n${activeRules.map((r) => `- ${r.text}`).join("\n")}`
    : ""
}
Mock Endpoint: ${endpointUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">
            Send to Anderson in Slack
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl"
          >
            x
          </button>
        </div>
        <div className="p-6 overflow-auto flex-1">
          <p className="text-sm text-amber-300 mb-4">
            Copy this and send to Anderson in Slack
          </p>
          <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap overflow-auto">
            {message}
          </pre>
        </div>
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm text-white rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
