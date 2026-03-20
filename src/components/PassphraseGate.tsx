import { useState } from "react";
import { FUNCTIONS_URL } from "../lib/supabase";

interface PassphraseGateProps {
  onAuthenticated: () => void;
}

export function PassphraseGate({ onAuthenticated }: PassphraseGateProps) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${FUNCTIONS_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        localStorage.setItem("yachtomatic_auth", "true");
        onAuthenticated();
      } else {
        setError(data.error || "Invalid passphrase");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100">Yachtomatic</h1>
          <p className="text-sm text-gray-400 mt-1">Enter passphrase to continue</p>
        </div>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Passphrase"
          autoFocus
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={!passphrase.trim() || isLoading}
          className="py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
