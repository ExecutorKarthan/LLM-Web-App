// Import needed modules
import { JSX, useEffect, useState } from "react";
import axios from "axios";
import SplashGate from "./components/Splashgate";
import MainApp from "./components/MainApp";

// Check if cookie token exists on the server
const checkTokenServerSide = async (): Promise<boolean> => {
  try {
    const res = await axios.get(
      import.meta.env.VITE_BACKEND_URL + "/api/check-cookie/",
      { withCredentials: true }
    );
    if (res.data.token_exists === true) {
      console.log(res);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to check token:", err);
    return false;
  }
};

// Run app
function App(): JSX.Element {
  // Create constatns and their mutations for reference
  const [cookiePresent, setCookiePresent] = useState<boolean>(false);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);

  useEffect(() => {
    const checkCookie = async () => {
      const present = await checkTokenServerSide();
      setCookiePresent(present);
    };
    checkCookie();

    if (localStorage.getItem("gemini_token")) {
      setTermsAgreed(true);
    }
  }, []);

  // If no API key, show SplashGate to collect it
  if (termsAgreed && cookiePresent){
    return <MainApp />;
  } else {
    return <SplashGate />;
  }

  // If API key is set, show main app with key passed as prop
}

// Export function for use
export default App;
