import { useState } from "react";

interface SplashGateProps {
  onUnlock: (token: string) => void;  // Now passing token back
}

const SplashGate: React.FC<SplashGateProps> = ({ onUnlock }) => {
  const [agreed, setAgreed] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!agreed) {
      setError("You must agree to the terms.");
      return;
    }
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/store-key/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save API key");
      }

      const data = await response.json();

      // Pass token back to parent component
      onUnlock(data.token);

      // Wipe API key input immediately after sending
      setApiKey("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1>Terms & Conditions</h1>
      <p>
        By using this app, you agree to the following terms and conditions...
        {/* Replace with your actual terms */}
      </p>

      <label style={{ display: "block", margin: "1rem 0" }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        I agree to the terms and conditions
      </label>

      <label style={{ display: "block", marginBottom: "1rem" }}>
        Enter your API key:
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          disabled={loading}
        />
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleSubmit}
        style={{ padding: "0.75rem 1.5rem" }}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Continue"}
      </button>
    </div>
  );
};

export default SplashGate;
