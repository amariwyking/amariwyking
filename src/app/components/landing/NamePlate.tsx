"use client";

import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useEffect, useRef, useState } from 'react';

// Register GSAP plugins
gsap.registerPlugin(ScrambleTextPlugin, SplitText);

// Character set for scrambling 
const defaultChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export default function NamePlate() {
    // Ref to track the paragraph element
    const nameRef = useRef<HTMLDivElement>(null);

    // Ref to store SplitText instance for cleanup
    const splitTextRef = useRef<SplitText | null>(null);

    // Original text content
    const originalText = "AMARI WYKING GARRETT";

    // GSAP animations setup for name plate and initial scramble
    useGSAP(() => {
        const nameElement = nameRef.current;
        if (!nameElement) return;

        const splitInstance = SplitText.create(nameElement, {
            type: "chars, words",
            wordsClass: "word++",
            charsClass: "char"
        });

        splitTextRef.current = splitInstance;

        const chars = nameElement.querySelectorAll('.char');

        console.log(chars)

        chars.forEach(char => {
            const originalChar = char.textContent || '';
            if (originalChar !== ' ' && originalChar !== ':') {
                char.textContent = defaultChars[Math.floor(Math.random() * defaultChars.length)];
            }
        });

        const tl = gsap.timeline();
        const originalWords = originalText.split(" ")

        splitInstance.words.forEach((word, index) => {
            tl.to(word, {
                duration: 1.5,
                scrambleText: {
                    text: originalWords[index],
                    speed: 2.5,
                    chars: defaultChars,
                    tweenLength: false,
                }
            }, index === 0 ? "" : "<");
        });

        tl.to(".word3", {
            opacity: 0.3,
            duration: 2.0,
            ease: "power2.inOut",
        }, "+=0.1")

        return () => {
            if (splitTextRef.current) {
                splitTextRef.current.revert();
            }
        };
    }, []);

    return (
        <div className="flex flex-row order-1">

            <p
                ref={nameRef}
                className="name w-full font-kode-mono font-medium text-center sm:text-left leading-[1.15] tracking-normal text-primary text-4xl md:text-7xl lg:text-9xl"
                aria-level={1}
                aria-label="Amari Wyking Garrett"
            >
                AMARI WYKING GARRETT
            </p>
        </div>
    );
}