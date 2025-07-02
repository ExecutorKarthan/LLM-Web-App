import { useEffect, useState } from "react";
import SplashGate from "./components/Splashgate";
import MainApp from "./components/MainApp";

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const handleUnload = () => {
      if (token) {
        navigator.sendBeacon(
          import.meta.env.VITE_BACKEND_URL + "/api/remove-key/",
          JSON.stringify({ token })
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [token]);

  const handleUnlock = async (key: string) => {
    const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/store-key/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: key }),
    });

    const data = await res.json();
    if (data.token) {
      setToken(data.token);
    }
  };

  return token ? <MainApp token={token} /> : <SplashGate onUnlock={handleUnlock} />;
}

export default App;
