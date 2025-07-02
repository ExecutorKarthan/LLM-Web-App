import { useState, useEffect } from "react";
import SplashGate from "./components/SplashGate";
import MainApp from "./components/MainApp";

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  // Optional: Clear token on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      setToken(null);  // wipe token on tab close or refresh
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (!token) {
    return <SplashGate onUnlock={setToken} />;
  }

  // Pass token to main app for authenticated API calls
  return <MainApp token={token} />;
};

export default App;
