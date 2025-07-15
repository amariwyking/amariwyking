"use client";

import { useState, useEffect, useMemo } from "react";
import QuoteIntro from "./components/landing/QuoteIntro";
import LandingPage from "./components/landing/LandingPage";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"
import { Container, ISourceOptions, MoveDirection, OutMode } from "@tsparticles/engine";

import colors from 'tailwindcss/colors'

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);
  const [init, setInit] = useState(false);

  console.log(colors.zinc['400'])

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

  // On the first render, initialize the tsParticles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => { setInit(true) });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "fff",
        },
      },
      fpsLimit: 120,
      particles: {
        color: {
          value: "#9f9fa9",
          // value: colors.zinc['400'],
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 100,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }), []);

  return (
    <>
      <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} />
      {showIntro ? (
        <QuoteIntro onComplete={handleIntroComplete} />
      ) : (
        <LandingPage />
      )}
    </>
  );
}
