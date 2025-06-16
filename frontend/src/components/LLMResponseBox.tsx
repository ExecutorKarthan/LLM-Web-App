import { useState } from "react";
import axios from "axios";

interface LLMResponseProps {
    userRequest: string;
}

const LLMResponseBox: React.FC<LLMResponseProps> = ({userRequest}) =>{
  const [response, setResponse] = useState<string>("");
   const submitRequest = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/ask/", {
        prompt: userRequest,
      });

      setResponse(res.data.response); // Adjust to match your Django response key
    } catch (error) {
      console.error("Error calling backend:", error);
      setResponse("Error processing your request.");
    }
  };

  return (
    <div>
      <button onClick={submitRequest} style={{ padding: "10px" }}>
        Submit request
      </button>
      <p>{response}</p>
    </div>
  );
};

export default LLMResponseBox;