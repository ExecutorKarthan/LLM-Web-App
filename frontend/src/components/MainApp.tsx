import { useState } from "react";
import LLMResponseBox from "./LLMResponseBox";

interface MainAppProps {
  token: string;
}

const MainApp: React.FC<MainAppProps> = ({ token }) => {
  const [userRequest, setUserRequest] = useState("");

  return (
    <div>
      <textarea
        placeholder="Enter your prompt"
        value={userRequest}
        onChange={(e) => setUserRequest(e.target.value)}
        style={{ width: "100%", height: "100px" }}
      />
      <LLMResponseBox userRequest={userRequest} token={token} />
    </div>
  );
};

export default MainApp;
