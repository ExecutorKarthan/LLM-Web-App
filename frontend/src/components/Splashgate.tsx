import { useState, useEffect } from "react";

interface SplashGateProps {
  onUnlock: (apiKey: string) => void;
}

const SplashGate: React.FC<SplashGateProps> = ({ onUnlock }) => {
  const [agreed, setAgreed] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  function setCookie(name: string, value: string, days?: number): void {
  const expires = days
    ? "; expires=" + new Date(Date.now() + days * 864e5).toUTCString()
    : "";
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

  const handleSubmit = () => {
    if (!agreed) {
      setError("You must agree to the terms.");
      return;
    }
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }

    localStorage.setItem("agreedToTerms", "true");
    localStorage.setItem("userApiKey", apiKey.trim());
    onUnlock(apiKey.trim());
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
        />
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleSubmit} style={{ padding: "0.75rem 1.5rem" }}>
        Continue
      </button>
    </div>
  );
};

export default SplashGate;
