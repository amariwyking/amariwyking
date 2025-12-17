"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useRef, useLayoutEffect } from "react";

gsap.registerPlugin(SplitText);

interface QuoteIntroProps {
  onComplete: () => void;
}

export default function QuoteIntro({ onComplete }: QuoteIntroProps) {
  const clause1Ref = useRef<HTMLDivElement>(null);
  const clause2Ref = useRef<HTMLDivElement>(null);
  const clause3Ref = useRef<HTMLDivElement>(null);
  const attributionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitTextRefs = useRef<SplitText[]>([]);

  const clause1 =
    "There is never a time in the future in which we will work out our salvation.";
  const clause2 = "The challenge is in the moment...";
  const clause3 = "The time is always now.";

  useGSAP(() => {
    const clause1Element = clause1Ref.current;
    const clause2Element = clause2Ref.current;
    const clause3Element = clause3Ref.current;
    const attributionElement = attributionRef.current;
    const containerElement = containerRef.current;

    if (
      !clause1Element ||
      !clause2Element ||
      !clause3Element ||
      !attributionElement ||
      !containerElement
    )
      return;

    // Create SplitText instances for each clause
    const split1 = SplitText.create(clause1Element, {
      type: "words, lines",
      wordsClass: "quote-word",
    });
    const split2 = SplitText.create(clause2Element, {
      type: "words, lines",
      wordsClass: "quote-word",
    });
    const split3 = SplitText.create(clause3Element, {
      type: "words, lines",
      wordsClass: "quote-word",
    });

    splitTextRefs.current = [split1, split2, split3];

    // Create timeline
    const tl = gsap.timeline();

    // Animate first clause in
    tl.from(split1.lines, {
      delay: 0.5,
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power2.out",
    })

      // Move first clause up and animate second clause to center
      .to(
        clause1Element,
        {
          y: -20,
          duration: 0.8,
          ease: "power2.out",
        },
        "+=3"
      )
      .from(
        split2.lines,
        {
          opacity: 0,
          y: 20,
          stagger: 0.05,
          duration: 1,
          ease: "power2.out",
        },
        "<+0.2"
      )

      // Move previous clauses up and animate third clause to center
      .to(
        clause1Element,
        {
          y: -40,
          duration: 0.8,
          ease: "power2.out",
        },
        "+=2"
      )
      .to(
        clause2Element,
        {
          y: -20,
          duration: 0.8,
          ease: "power2.out",
        },
        "<"
      )
      .from(
        split3.lines,
        {
          opacity: 0,
          y: 20,
          stagger: 0.05,
          duration: 1,
          ease: "power2.out",
        },
        "<+0.2"
      )

      // Animate attribution
      .from(
        attributionElement,
        {
          opacity: 0,
          duration: 1.5,
          ease: "power2.out",
        },
        "<+0.2"
      )

      // Fade all elements except final clause
      .to(
        [clause1Element, clause2Element, attributionElement],
        {
          opacity: 0,
          duration: 1.5,
        },
        "+=1.2"
      )

      // Glow effect on the final clause
      .to(
        split3.lines,
        {
          textShadow:
            "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6)",
          duration: 2.0,
          ease: "back.out",
          yoyo: true,
          yoyoEase: true,
        },
        "-=1"
      )

      // Fade out entire container
      .to(
        clause3Element,
        {
          opacity: 0,
          duration: 1,
        },
        "+=0.5"
      )
      .to(
        containerElement,
        {
          opacity: 0,
          duration: 2,
          ease: "power1.inOut",
          onComplete: () => {
            onComplete();
          },
        },
        "-=0.5"
      );

    // Cleanup function
    return () => {
      splitTextRefs.current.forEach((split) => split.revert());
      splitTextRefs.current = [];
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="quote-intro fixed inset-0 z-9999 bg-background flex items-center justify-center px-8"
      aria-hidden="true"
    >
      <div className="max-w-4xl mx-auto text-left text-foreground text-2xl md:text-4xl lg:text-5xl font-light leading-relaxed">
        <div className="flex flex-col space-y-4">
          <p ref={clause1Ref}>
            {clause1}
          </p>
          <p ref={clause2Ref}>
            {clause2}
          </p>
          <p ref={clause3Ref}>
            {clause3}
          </p>
        </div>
        <cite
          ref={attributionRef}
          className="attribution block mt-8 text-gray-300 text-lg md:text-xl lg:text-2xl font-medium text-right"
        >
          — James Baldwin
        </cite>
      </div>
    </div>
  );
}
