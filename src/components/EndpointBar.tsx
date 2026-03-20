import { useState } from "react";

interface EndpointBarProps {
  url: string | null;
  mode: "locked" | "live";
  isLocking: boolean;
  onToggleMode: () => void;
}

export function EndpointBar({
  url,
  mode,
  isLocking,
  onToggleMode,
}: EndpointBarProps) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">
          Mock Endpoint
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              mode === "locked"
                ? "bg-green-900 text-green-300"
                : "bg-amber-900 text-amber-300"
            }`}
          >
            {mode === "locked" ? "Locked" : "Live"}
          </span>
          <button
            onClick={onToggleMode}
            disabled={isLocking}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            Switch to {mode === "locked" ? "Live" : "Locked"}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-gray-800 rounded px-3 py-2 text-blue-300 truncate">
          {url}
        </code>
        <button
          onClick={handleCopy}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs text-gray-100 rounded transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {mode === "live" && (
        <p className="text-xs text-gray-500">
          Live mode: include <code className="text-gray-400">X-Api-Key</code>{" "}
          header with your Anthropic key on each request.
        </p>
      )}
    </div>
  );
}
