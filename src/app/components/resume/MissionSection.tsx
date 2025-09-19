"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function MissionSection() {
  const missionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const missionSection = missionRef.current;

    if (!missionSection) return;

    // Create GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      // Mission Section - Pinned
      gsap
        .timeline({
          scrollTrigger: {
            trigger: missionSection,
            start: "top 30%",
            end: "+=100%",
          },
        })
        .fromTo(
          ".mission-content",
          { opacity: 0, y: 100 },
          { opacity: 1, y: 0, duration: 0.5 }
        )
        .addLabel("missionAnimation");
      // .to(".mission-content", { opacity: 0, y: -50, duration: 0.5 }, "+=0.5");
    }, missionRef);

    return () => {
      ctx.revert(); // Only kills ScrollTriggers created within this context
    };
  }, []);

  return (
    <section
      id="mission"
      ref={missionRef}
      className="resume-section mission-section min-h-screen flex items-center justify-center relative"
    >
      <div className="mission-content max-w-6xl mx-auto px-8 text-center">
        <p className="font-work-sans text-xl md:text-4xl text-foreground leading-relaxed">
          To support the deployment of data-centric technologies that bolster
          the sustainability of urban life.
        </p>
      </div>
    </section>
  );
}
