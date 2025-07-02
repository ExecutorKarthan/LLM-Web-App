import { useState } from "react";

interface LLMResponseProps {
  userRequest: string;
  token: string;
}

const LLMResponseBox: React.FC<LLMResponseProps> = ({ userRequest, token }) => {
  const [response, setResponse] = useState("");

  const submitRequest = async () => {
    const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/ask/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userRequest, token }),
    });

    const data = await res.json();
    setResponse(data.response || "Error: " + (data.error ?? "unknown error"));
  };

  return (
    <div>
      <button onClick={submitRequest}>Submit</button>
      <div>{response}</div>
    </div>
  );
};

export default LLMResponseBox;
