"use client";

import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Typography } from '@material-tailwind/react';
import { useRef, useEffect } from 'react';

// Register GSAP plugins
gsap.registerPlugin(ScrambleTextPlugin, SplitText);

// Character set for scrambling 
const defaultChars = "01"

export default function HeroName() {
    // Ref to track the typography element
    const nameRef = useRef<HTMLDivElement>(null);

    // Ref to store SplitText instance for cleanup
    const splitTextRef = useRef<SplitText | null>(null);

    // Original text content
    const originalText = "AMARI WYKING";

    // GSAP animations setup
    useGSAP(() => {
        const nameElement = nameRef.current;
        if (!nameElement) return;

        // Create SplitText instance first
        const splitInstance = SplitText.create(nameElement, {
            type: "chars, words",
            wordsClass: "word++",
            charsClass: "char"
        });

        // Store reference for cleanup
        splitTextRef.current = splitInstance;

        // Now scramble the text content of each character element
        const chars = nameElement.querySelectorAll('.char');

        chars.forEach(char => {
            const originalChar = char.textContent || '';
            if (originalChar !== ' ' && originalChar !== ':') {
                char.textContent = defaultChars[Math.floor(Math.random() * defaultChars.length)];
            }
        });

        const staggerSpeed = 0.1;
        const entranceEase = "power2.in"
        const entranceDuration = 0.5;
        const scrambleDuration = 0.8;

        // Create timeline for coordinated animations
        const tl = gsap.timeline();

        // Entrance animation for first word (scrambled AMARI)
        tl.from(".word1 .char", {
            opacity: 0,
            ease: entranceEase,
            duration: entranceDuration,
            stagger: -1 * staggerSpeed,
        })

        // Entrance animation for second word (scrambled WYKING)
        tl.from(".word2 .char", {
            opacity: 0,
            ease: entranceEase,
            duration: entranceDuration,
            stagger: staggerSpeed,
        }, "<")

        // Wait for entrance animations to mostly complete, then unscramble
        tl.to(nameElement, {
            duration: scrambleDuration,              // Unscramble duration
            scrambleText: {
                text: originalText,      // Reveal the real text
                speed: 2,                // Speed of character changes
                chars: defaultChars,     // Use full character set for scrambling
                tweenLength: false,      // Don't animate length changes
            }
        }, "+=0.4"); // Start unscrambling before entrance fully completes

        // Cleanup function
        return () => {
            if (splitTextRef.current) {
                splitTextRef.current.revert();
            }
        };
    }, [originalText]);

    return (
        <div className="h-screen flex items-center justify-center">
            <Typography
                ref={nameRef}
                className="name font-bold text-center text-clip leading-tight tracking-normal text-gray-800 dark:text-gray-100 mx-auto my-6 w-full text-9xl select-none"
                role="heading"
                aria-level={1}
                aria-label="Amari Wyking"
            >
                AMARI WYKING
            </Typography>
        </div>
    );
}