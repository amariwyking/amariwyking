"use client";

import { useState, useEffect } from "react";
import QuoteIntro from "./components/landing/QuoteIntro";
import LandingPage from "./components/landing/LandingPage";

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");

    if (hasVisited === "true") {
      setShowIntro(false);
    } else {
      setShowIntro(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro ? (
        <QuoteIntro onComplete={handleIntroComplete} />
      ) : (
        <LandingPage />
      )}
    </>
  );
}
