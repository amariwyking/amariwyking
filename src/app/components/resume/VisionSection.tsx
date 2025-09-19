"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function VisionSection() {
  const visionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const visionSection = visionRef.current;

    if (!visionSection) return;

    // Create GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      // Vision Section - Pinned
      gsap
        .timeline({
          scrollTrigger: {
            trigger: visionSection,
            start: "top 30%",
            end: "+=100%",
          },
        })
        .fromTo(
          ".vision-content",
          { opacity: 0, y: 100 },
          { opacity: 1, y: 0, duration: 0.5 }
        )
        .addLabel("visionAnimation")
        // .to(".vision-content", { opacity: 0, y: -50, duration: 0.5 }, "+=0.5");
    }, visionRef);

    return () => {
      ctx.revert(); // Only kills ScrollTriggers created within this context
    };
  }, []);

  return (
    <section
      id="vision"
      ref={visionRef}
      className="resume-section vision-section min-h-screen flex items-center justify-center relative"
    >
      <div className="vision-content max-w-3xl mx-auto px-8 text-center">
        <p className="font-work-sans text-xl md:text-4xl leading-relaxed">
          A world where cities thrive without compromising our planet&apos;s
          future.
        </p>
      </div>
    </section>
  );
}