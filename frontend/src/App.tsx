// Import needed modules
import { useEffect, useState } from "react";
import SplashGate from "./components/Splashgate";
import MainApp from "./components/MainApp";

// Run app
function App() {
  
  // Store API key in local storage
   const [apiKey, setApiKey] = useState<string | null>(() => {
    return localStorage.getItem("gemini_token");
  });

   // When token changes, sync it to sessionStorage
  useEffect(() => {
    if (apiKey) {
     localStorage.setItem("gemini_token", apiKey);
    } else {
      localStorage.removeItem("gemini_token");
    }
  }, [apiKey]);

  // Called when user enters their API key 
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

// Export function for use
export default App;