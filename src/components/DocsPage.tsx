interface DocsPageProps {
  onBack: () => void;
}

export function DocsPage({ onBack }: DocsPageProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Yachtomatic</h1>
            <p className="text-sm text-gray-400">Documentation</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-gray-100 rounded-lg transition-colors"
          >
            Back to App
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="flex flex-col gap-8 text-sm text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">What is Yachtomatic?</h2>
            <p>
              Yachtomatic is a mock API tool that lets you define a JSON response structure,
              generate realistic sample data using Claude AI, and serve that data from a live
              endpoint. This lets your team build and test app features against a real API
              without waiting for the backend to be built.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Quick Start</h2>
            <ol className="list-decimal list-inside flex flex-col gap-2">
              <li>Enter the <strong className="text-gray-100">passphrase</strong> to access the app</li>
              <li>Paste your desired <strong className="text-gray-100">JSON output structure</strong> in the schema editor</li>
              <li>Add any <strong className="text-gray-100">rules</strong> to control how the sample data is generated</li>
              <li>Enter your <strong className="text-gray-100">Anthropic API key</strong></li>
              <li>Click <strong className="text-gray-100">Generate</strong></li>
              <li>Copy the <strong className="text-gray-100">Mock Endpoint URL</strong> and use it in your app</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Schema Editor</h2>
            <p>
              Paste the JSON structure you want the API to return. Use descriptive placeholder
              values to guide the AI — for example, use <code className="bg-gray-800 px-1 rounded">"text"</code> for
              strings, <code className="bg-gray-800 px-1 rounded">"rich text (html)"</code> for HTML
              content, <code className="bg-gray-800 px-1 rounded">"uuid"</code> for IDs, etc.
            </p>
            <p className="mt-2">
              The editor validates your JSON in real-time and shows errors inline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Rules</h2>
            <p>
              Rules are instructions that control how Claude generates the sample data.
              Each rule is sent as a prompt instruction alongside your schema. Examples:
            </p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
              <li>Keep item_id and conversation_id the same across regenerations</li>
              <li>Use realistic UUIDs for all ID fields</li>
              <li>Link keywords should relate to boat systems (electrical, engine, hull)</li>
              <li>Always include at least one create_task action</li>
            </ul>
            <p className="mt-2">
              You can temporarily disable a rule by unchecking it, or delete it with the X button.
              Only checked (active) rules are sent when generating.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Saved Schemas</h2>
            <p>
              You can save your current schema, rules, and API key as a named preset
              (e.g. "Task System", "Messages", "Notifications"). Saved schemas persist
              in the database and can be loaded by anyone with access to the app.
            </p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
              <li><strong className="text-gray-100">Save Current Schema As...</strong> — saves the current schema, active rules, and API key under a name</li>
              <li><strong className="text-gray-100">Load</strong> — loads a saved schema, replacing the current editor contents, rules, and API key</li>
              <li><strong className="text-gray-100">Delete</strong> — permanently removes a saved schema</li>
            </ul>
            <p className="mt-2">
              If you save with the same name as an existing preset, it will overwrite it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">API Key</h2>
            <p>
              You need an <strong className="text-gray-100">Anthropic API key</strong> to generate
              responses. The key is sent server-side to call Claude — it is never stored in the
              database unless you explicitly save a schema (in which case it is stored alongside
              the schema for convenience). Get a key
              at <code className="bg-gray-800 px-1 rounded">console.anthropic.com</code>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Mock Endpoint</h2>
            <p>
              After generating a response, you get a <strong className="text-gray-100">Mock Endpoint URL</strong>.
              This is the URL your app should call to get the mock data.
            </p>

            <h3 className="text-base font-medium text-gray-200 mt-4 mb-2">Locked Mode (default)</h3>
            <p>
              Returns the exact same cached response every time. No API key needed.
              This is what you want for most development and testing — fast, free, consistent.
            </p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mt-2 font-mono text-xs">
              <span className="text-green-400">GET</span> https://...supabase.co/functions/v1/mock?session=YOUR_SESSION_ID
            </div>

            <h3 className="text-base font-medium text-gray-200 mt-4 mb-2">Live Mode</h3>
            <p>
              Calls Claude fresh on every request, generating new data each time.
              Requires an <code className="bg-gray-800 px-1 rounded">X-Api-Key</code> header
              with your Anthropic key. Rate limited to 10 requests per minute per session.
            </p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mt-2 font-mono text-xs">
              <span className="text-green-400">GET</span> https://...supabase.co/functions/v1/mock?session=YOUR_SESSION_ID<br />
              <span className="text-gray-500">Header:</span> X-Api-Key: sk-ant-...
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Webhook / Generate Endpoint</h2>
            <p>
              The generate endpoint lets you create mock responses programmatically
              (without the UI). POST a JSON body with your schema, rules, and Anthropic API key:
            </p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mt-2 font-mono text-xs">
              <span className="text-amber-400">POST</span> https://...supabase.co/functions/v1/generate<br />
              <br />
              {`{`}<br />
              {"  "}"schema": {`"{...your JSON structure...}"`},<br />
              {"  "}"rules": ["rule 1", "rule 2"],<br />
              {"  "}"apiKey": "sk-ant-...",<br />
              {"  "}"sessionId": null<br />
              {`}`}
            </div>
            <p className="mt-2">
              The response includes a <code className="bg-gray-800 px-1 rounded">sessionId</code> and
              the generated <code className="bg-gray-800 px-1 rounded">data</code>. Pass the sessionId
              on subsequent calls to update the same session instead of creating a new one.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Custom Endpoints (Per-Schema URLs)</h2>
            <p>
              Each saved schema can have its own <strong className="text-gray-100">custom endpoint URL</strong>.
              When saving a schema, you assign it an endpoint path (e.g. <code className="bg-gray-800 px-1 rounded">tasks</code>,{" "}
              <code className="bg-gray-800 px-1 rounded">messages</code>,{" "}
              <code className="bg-gray-800 px-1 rounded">notifications</code>).
              This creates a permanent, human-readable URL for that schema:
            </p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mt-2 font-mono text-xs">
              <span className="text-green-400">GET</span> https://...supabase.co/functions/v1/api/<span className="text-amber-300">tasks</span><br />
              <span className="text-green-400">GET</span> https://...supabase.co/functions/v1/api/<span className="text-amber-300">messages</span><br />
              <span className="text-green-400">GET</span> https://...supabase.co/functions/v1/api/<span className="text-amber-300">notifications</span>
            </div>

            <h3 className="text-base font-medium text-gray-200 mt-4 mb-2">How it works</h3>
            <ol className="list-decimal list-inside flex flex-col gap-2">
              <li>Create your schema and generate a response in the UI</li>
              <li>Click <strong className="text-gray-100">"Save Current Schema As..."</strong></li>
              <li>Give it a name and an <strong className="text-gray-100">endpoint path</strong> (e.g. <code className="bg-gray-800 px-1 rounded">tasks</code>)</li>
              <li>The generated response is saved with the schema — this is what the endpoint returns</li>
              <li>Anyone can now hit <code className="bg-gray-800 px-1 rounded">/api/tasks</code> and get that exact response</li>
            </ol>

            <h3 className="text-base font-medium text-gray-200 mt-4 mb-2">Updating the response</h3>
            <p>
              To update what an endpoint returns: load the schema, make changes, regenerate,
              then re-save with the same name. The locked response will be updated.
            </p>

            <h3 className="text-base font-medium text-gray-200 mt-4 mb-2">Custom endpoints vs. session-based mock</h3>
            <ul className="list-disc list-inside flex flex-col gap-2 mt-2">
              <li><strong className="text-gray-100">Custom endpoints</strong> (<code className="bg-gray-800 px-1 rounded">/api/tasks</code>) — permanent, human-readable, tied to saved schemas. Use these in your app.</li>
              <li><strong className="text-gray-100">Session mock endpoint</strong> (<code className="bg-gray-800 px-1 rounded">/mock?session=...</code>) — temporary (1 hour), for quick testing. Useful for one-off experiments.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">For Anderson (Backend Developer)</h2>
            <p>
              You can see all saved schemas and their custom endpoints in the app. Each saved
              schema shows:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2 mt-2">
              <li>The <strong className="text-gray-100">exact JSON structure</strong> the frontend expects</li>
              <li>The <strong className="text-gray-100">endpoint URL</strong> they are calling (e.g. <code className="bg-gray-800 px-1 rounded">/api/tasks</code>)</li>
              <li>The <strong className="text-gray-100">rules/constraints</strong> on the response format</li>
              <li>A <strong className="text-gray-100">locked sample response</strong> showing exactly what they expect back</li>
            </ul>
            <p className="mt-2">
              When you build the real API, match the response format to what is saved here.
              The custom endpoint path tells you what URL they are integrating against.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Sessions</h2>
            <p>
              Each time you generate a response, a session is created in the database.
              Sessions expire after <strong className="text-gray-100">1 hour</strong> and are
              automatically cleaned up. If your mock endpoint stops working, just generate
              a new response to create a fresh session.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Tips</h2>
            <ul className="list-disc list-inside flex flex-col gap-2">
              <li>Use descriptive placeholder values in your schema — Claude uses them to understand what kind of data to generate</li>
              <li>Be specific in your rules — "use yacht maintenance context" gives better results than "be realistic"</li>
              <li>Save schemas you use frequently — they persist across sessions and team members</li>
              <li>Use Locked mode for development — it is instant and free (no API calls)</li>
              <li>The mock endpoint supports CORS, so you can call it from any frontend</li>
            </ul>
          </section>

        </div>
      </main>
    </div>
  );
}
