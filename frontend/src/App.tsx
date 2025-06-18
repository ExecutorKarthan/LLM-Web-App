import { useState } from "react";
import SplashGate from "./components/Splashgate";
import MainApp from "./components/MainApp";

function App() {
  // Store API key in React state only — no persistence
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Called when user enters their API key (e.g., via SplashGate)
  const handleUnlock = (key: string) => {
    setApiKey(key);
  };

  // If no API key, show SplashGate to collect it
  if (!apiKey) {
    return <SplashGate onUnlock={handleUnlock} />;
  }

  // If API key is set, show main app with key passed as prop
  return <MainApp userApiKey={apiKey} />;
}

export default App;
