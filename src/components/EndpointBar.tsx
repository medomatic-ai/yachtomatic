import { useState } from "react";
import { FUNCTIONS_URL } from "../lib/supabase";

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
  const [copiedMock, setCopiedMock] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  if (!url) return null;

  const webhookUrl = `${FUNCTIONS_URL}/generate`;

  const handleCopyMock = async () => {
    await navigator.clipboard.writeText(url);
    setCopiedMock(true);
    setTimeout(() => setCopiedMock(false), 2000);
  };

  const handleCopyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
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
              title={mode === "locked"
                ? "Switch to Live mode — each request generates a fresh response using Claude (requires X-Api-Key header)"
                : "Switch to Locked mode — serve the same cached response every time (no API key needed)"}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              Switch to {mode === "locked" ? "Live" : "Locked"}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {mode === "locked"
            ? "Returns the same cached response every time. No API key needed."
            : "Generates a fresh response on each request. Requires X-Api-Key header."}
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-gray-800 rounded px-3 py-2 text-blue-300 truncate">
            {url}
          </code>
          <button
            onClick={handleCopyMock}
            title="Copy the mock endpoint URL to use in your app"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs text-gray-100 rounded transition-colors shrink-0"
          >
            {copiedMock ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-3 flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-300" title="Use this endpoint to generate responses programmatically via POST requests">
          Webhook / Generate Endpoint
        </span>
        <p className="text-xs text-gray-500">
          POST to this URL with {"{"} schema, rules, apiKey {"}"} to generate responses programmatically. The apiKey is your Anthropic API key (same one you entered above).
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-gray-800 rounded px-3 py-2 text-blue-300 truncate">
            {webhookUrl}
          </code>
          <button
            onClick={handleCopyWebhook}
            title="Copy the generate endpoint URL"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-xs text-gray-100 rounded transition-colors shrink-0"
          >
            {copiedWebhook ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
