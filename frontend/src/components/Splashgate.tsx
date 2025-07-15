import { useState } from "react";

interface SplashGateProps {
  onUnlock: (apiKey: string) => void;
}

const SplashGate: React.FC<SplashGateProps> = ({ onUnlock }) => {
  const [agreed, setAgreed] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!agreed) {
      setError("You must agree to the terms.");
      return;
    }
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }

    onUnlock(apiKey.trim());
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1>Terms & Conditions</h1>
      <p>
        By using this app, you agree to the following terms and conditions:
        <br /><br />
        <strong>1. Use in Accordance with Model Provider Terms</strong><br />
        This tool uses the Gemini large language model provided by Google. Your use of this application must fully comply with Google’s{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">AI Terms of Service</a> and any other applicable terms governing the use of their large language models.
        <br /><br />
        <strong>2. Intended for Academic Use Only</strong><br />
        This tool is designed exclusively for educational demonstration and instructional purposes. It is not intended for commercial or recreational use.
        <br /><br />
        <strong>3. No Student Use Without Explicit District Approval</strong><br />
        Students must <strong>not</strong> use this tool unless:<br />
        &nbsp;&nbsp;&bull; Their school district’s IT department has explicitly approved such use, <strong>and</strong><br />
        &nbsp;&nbsp;&bull; The use complies with Google’s terms for AI services.<br />
        School districts are responsible for ensuring compliance with their institution’s policies regarding student interaction with AI technologies.
        <br /><br />
        <strong>4. API Key Handling and Browser Security</strong><br />
        Your API key is temporarily stored in your browser’s memory (not on any external server). For security reasons:<br />
        &nbsp;&nbsp;&bull; Do <strong>not</strong> leave your browser unattended while the key is active.<br />
        &nbsp;&nbsp;&bull; <strong>Refreshing</strong> or <strong>closing</strong> the tab or browser will automatically clear the API key from memory.<br />
        &nbsp;&nbsp;&bull; It is your responsibility to manage this key securely and to avoid unauthorized access.
        <br /><br />
        By clicking "Continue" or using the application, you confirm that you understand and accept these conditions.
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
