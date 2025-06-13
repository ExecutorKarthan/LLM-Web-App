import { useState } from "react";

interface LLMResponseProps {
  userRequest: string;
}

const LLMResponseBox: React.FC<LLMResponseProps> = ({ userRequest }) => {
  const [response, setResponse] = useState("");

  const submitRequest = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userRequest }),
    });

    const data = await res.json();
    setResponse(data.output);
  };

  return (
    <div>
      <button onClick={submitRequest}>Ask</button>
      <p>{response}</p>
    </div>
  );
};

export default LLMResponseBox;
