
"use client";

import { useState } from "react";
import QuoteIntro from "./components/landing/QuoteIntro";
import LandingPage from "./components/landing/LandingPage";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <QuoteIntro onComplete={handleIntroComplete} />}
      {!showIntro && <LandingPage />}
    </>
  );
}