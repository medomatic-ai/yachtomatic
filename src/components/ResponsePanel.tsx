import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";

interface ResponsePanelProps {
  response: unknown | null;
  rawError: string | null;
  isGenerating: boolean;
}

export function ResponsePanel({
  response,
  rawError,
  isGenerating,
}: ResponsePanelProps) {
  if (isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-500 border-t-blue-400 rounded-full animate-spin" />
          Generating response...
        </div>
      </div>
    );
  }

  if (rawError) {
    return (
      <div className="flex-1 flex flex-col gap-2">
        <div className="bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-300">
          {rawError}
        </div>
        {response != null && (
          <pre className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 overflow-auto whitespace-pre-wrap">
            {typeof response === "string"
              ? response
              : JSON.stringify(response, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 border border-gray-700 rounded-lg">
        <p className="text-gray-500 text-sm">
          Define a schema and click Generate to see a response
        </p>
      </div>
    );
  }

  const formatted = JSON.stringify(response, null, 2);
  const highlighted = highlight(formatted, languages.json, "json");

  return (
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg overflow-auto">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-300">Response</span>
        <button
          onClick={() => navigator.clipboard.writeText(formatted)}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          Copy JSON
        </button>
      </div>
      <pre
        className="p-4 text-sm"
        style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', fontSize: 13 }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
