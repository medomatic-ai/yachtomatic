import { useState } from "react";
import { useMockSession } from "./hooks/useMockSession";
import { SchemaEditor } from "./components/SchemaEditor";
import { PromptInput } from "./components/PromptInput";
import { RulesList } from "./components/RulesList";
import { ApiKeyInput } from "./components/ApiKeyInput";
import { ResponsePanel } from "./components/ResponsePanel";
import { EndpointBar } from "./components/EndpointBar";
import { FinalizeModal } from "./components/FinalizeModal";

export default function App() {
  const session = useMockSession();
  const [showFinalize, setShowFinalize] = useState(false);

  const canGenerate =
    session.schema.trim() !== "" &&
    session.apiKey.trim() !== "" &&
    !session.isGenerating;

  let schemaValid = false;
  try {
    if (session.schema.trim()) {
      JSON.parse(session.schema);
      schemaValid = true;
    }
  } catch {
    schemaValid = false;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Yachtomatic</h1>
            <p className="text-sm text-gray-400">
              Mock API for Yotta Matic
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          <div className="flex flex-col gap-4 overflow-auto">
            <SchemaEditor
              value={session.schema}
              onChange={session.setSchema}
            />

            <PromptInput onAddRule={session.addRule} />

            <RulesList
              rules={session.rules}
              onToggle={session.toggleRule}
              onRemove={session.removeRule}
            />

            <ApiKeyInput
              value={session.apiKey}
              onChange={session.setApiKey}
            />

            <button
              onClick={session.generate}
              disabled={!canGenerate || !schemaValid}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              {session.isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-auto">
            <ResponsePanel
              response={session.response}
              rawError={session.rawError}
              isGenerating={session.isGenerating}
            />

            <EndpointBar
              url={session.mockEndpointUrl}
              mode={session.mode}
              isLocking={session.isLocking}
              onToggleMode={session.toggleMode}
            />

            {session.response != null && (
              <button
                onClick={() => setShowFinalize(true)}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
              >
                Finalize & Send to Anderson
              </button>
            )}
          </div>
        </div>
      </main>

      <FinalizeModal
        isOpen={showFinalize}
        onClose={() => setShowFinalize(false)}
        schema={session.schema}
        rules={session.rules}
        endpointUrl={session.mockEndpointUrl || ""}
      />
    </div>
  );
}
