// Import needed modules
import React from "react";
import processResponse from "../utils/responseProcessor";
import { Button } from "antd";
import axios from "axios";
import { BACKEND_URL } from "../config.js";

// Create an interface for type safety
interface LLMResponseProps {
  response: string;
  loading: boolean;
  error?: string;
  onSaveCode: (processedCode: string) => void;
}

// Create a box to display information about the LLM response
const LLMResponseBox: React.FC<LLMResponseProps> = ({
  response,
  loading,
  error,
  onSaveCode,
}) => {
  const displayContent = () => {
    if (loading) return "Loading...";
    if (error) return <span style={{ color: "red" }}>{error}</span>;
    if (!response) return "";
    return processResponse(response);
  };

  // Logs the user out of Gemini. The real API key lives server-side
  // (see views.tokenize_key / clear_token: it is cached against a UUID
  // stored in an httponly cookie that JS can neither read nor clear), so
  // the actual cleanup is the POST to /api/clear-token/.
  //
  // Reloading afterwards re-runs App's server-side session check, which
  // now finds no valid token and shows the splash gate again. There is no
  // client-side flag to reset: the server is the only authority.
  //
  // BACKEND_URL comes from src/config.ts. Do not use
  // import.meta.env.VITE_BACKEND_URL here: when it is unset the URL becomes
  // "undefined/api/clear-token/" and the server never sees the request.
  const handleClearToken = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}` + "/api/clear-token/",
        {},
        { withCredentials: true }
      );
      alert("Token and session cleared.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete token.");
    }
  };

  // True when there is a finished, error-free response to save
  const hasResponse = Boolean(response) && !loading && !error;

  // Return HTML for rendering
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 280,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          fontFamily: "monospace",
          fontSize: 14,
          padding: 10,
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
      >
        {/* Populate the response box with the response from the LLM */}
        {displayContent()}
      </div>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        {/* Transfer the code to the editor, only once there is a response */}
        {hasResponse && (
          <Button onClick={() => onSaveCode(processResponse(response))}>
            Save to Editor
          </Button>
        )}
        {/* Clear the session token, always available */}
        <Button danger onClick={handleClearToken}>
          Clear Token
        </Button>
      </div>
    </div>
  );
};

// Export component for use
export default LLMResponseBox;