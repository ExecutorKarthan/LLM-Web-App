import React from "react";
import processResponse from "../utils/responseProcessor";
import { Button } from "antd";

interface LLMResponseProps {
  response: string;
  loading: boolean;
  error?: string;
  onSaveCode: (processedCode: string) => void;
}

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
        {displayContent()}
      </div>

      {response && !loading && !error && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button onClick={() => onSaveCode(processResponse(response))}>
            Save to Editor
          </Button>
        </div>
      )}
    </div>
  );
};

export default LLMResponseBox;
