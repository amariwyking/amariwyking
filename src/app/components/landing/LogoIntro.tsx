"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useRef } from "react";

gsap.registerPlugin(DrawSVGPlugin);

interface LogoIntroProps {
  onComplete: () => void;
}

export default function LogoIntro({ onComplete }: LogoIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryPathRef = useRef<SVGPathElement>(null);
  const horizontalPathRef = useRef<SVGPathElement>(null);
  const verticalPathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const containerElement = containerRef.current;
    const primaryPath = primaryPathRef.current;
    const horizontalPath = horizontalPathRef.current;
    const verticalPath = verticalPathRef.current;

    if (!primaryPath || !horizontalPath || !verticalPath) return;

    const masterTl = gsap.timeline();

    // Animation timeline
    const tl = gsap.timeline({
      repeat: 1,
      yoyo: true,
      repeatDelay: 0.1,
    });

    tl.fromTo(
      primaryPath,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.5,
      }
    );

    // Reveal primary stroke from center
    tl.fromTo(
      primaryPath,
      {
        drawSVG: "50% 50%",
      },
      {
        drawSVG: "0% 100%",
        duration: 1.8,
        ease: "power2.inOut",
      },
      "-=25%"
    )

      // Fade in secondary paths
      .fromTo(
        horizontalPath,
        {
          opacity: 0,
          y: -10,
        },
        {
          opacity: 1,
          y: -0,
          duration: 1.2,
          ease: "power2.out",
        },
        "-=75%"
      )
      .fromTo(
        verticalPath,
        {
          opacity: 0,
          y: 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
        },
        "<"
      );

    tl.timeScale(1.25);

    masterTl.add(tl);
    masterTl.to(containerElement, {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      delay: 0.5,
      onComplete: () => {
        onComplete();
      },
    });
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="logo-intro fixed inset-0 z-9999 bg-background flex items-center justify-center"
      aria-hidden="true"
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 8.4667 8.4667"
        className="logo-svg text-foreground"
        aria-label="AW Logo"
      >
        <g
          transform="matrix(.060278 0 0 .060278 -19.576 .84522)"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5.6444"
        >
          <path
            ref={primaryPathRef}
            d="m335 86.208v-57.883a2.1167 2.1167 135 0 1 2.1167-2.1167h55.767a2.1167 2.1167 45 0 1 2.1167 2.1167v55.767a2.1167 2.1167 45 0 0 2.1167 2.1167h55.767a2.1167 2.1167 135 0 0 2.1167-2.1167v-57.883"
            stroke="currentColor"
            strokeMiterlimit="5"
            className="primary-stroke"
          />
          <path
            ref={horizontalPathRef}
            d="m355 56.208h20"
            stroke="currentColor"
            strokeMiterlimit="0"
            className="secondary-stroke"
          />
          <path
            ref={verticalPathRef}
            d="m425 46.208v20"
            stroke="currentColor"
            strokeMiterlimit="0"
            className="secondary-stroke"
          />
        </g>
      </svg>
    </div>
  );
}
