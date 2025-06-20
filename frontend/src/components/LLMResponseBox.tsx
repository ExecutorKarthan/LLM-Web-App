import React from "react";
import processResponse from "../utils/responseProcessor";
import { Button } from "antd";

interface LLMResponseProps {
  response: string;
  loading: boolean;
  onSaveCode: (code: string) => void;
}

const LLMResponseBox: React.FC<LLMResponseProps> = ({
  response,
  loading,
  onSaveCode,
}) => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flexGrow: 1,
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
        {loading ? "Loading..." : processResponse(response)}
      </div>
      {response && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button onClick={() => onSaveCode(response)}>Save to Editor</Button>
        </div>
      )}
    </div>
  );
};

export default LLMResponseBox;
