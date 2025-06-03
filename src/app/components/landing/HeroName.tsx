"use client";

import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Typography } from '@material-tailwind/react';
import { useRef, useEffect } from 'react';

// Register GSAP plugins
gsap.registerPlugin(ScrambleTextPlugin, SplitText);

// Configuration for scramble effect
const config = {
    random: true,
}

// Character set for scrambling 
const defaultChars = "01"

export default function HeroName() {
    // Ref to track the typography element
    const nameRef = useRef<HTMLDivElement>(null);

    // Ref to store SplitText instance for cleanup
    const splitTextRef = useRef<SplitText | null>(null);
    
    // Original text content
    const originalText = "AMARI : WYKING";

    // Function to generate scrambled version of text
    const generateScrambledText = (text: string) => {
        return text
            .split('')
            .map(char => {
                // Keep spaces and colons, scramble everything else
                if (char === ' ' || char === ':') return char;
                return defaultChars[Math.floor(Math.random() * defaultChars.length)];
            })
            .join('');
    };

    // GSAP animations setup
    useGSAP(() => {
        const nameElement = nameRef.current;
        if (!nameElement) return;

        // Create SplitText instance first
        const splitInstance = SplitText.create(nameElement, {
            type: "chars, words",
            wordDelimiter: " : ",
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
        const entranceDuration = 1.0;

        // Create timeline for coordinated animations
        const tl = gsap.timeline();

        const charAnimDistance = 50;

        // Entrance animation for first word (scrambled AMARI)
        tl.from(".word1 .char", {
            opacity: 0,
            y: (index) => Math.random() > 0.5 ? charAnimDistance : -1 * charAnimDistance,
            ease: "elastic.out(2.5)",
            duration: entranceDuration,
            stagger: -1 * staggerSpeed,
        })

        // Entrance animation for second word (scrambled WYKING)
        tl.from(".word2 .char", {
            opacity: 0,
            y: (index) => Math.random() > 0.5 ? charAnimDistance : -1 * charAnimDistance,
            ease: "elastic.out(2.5)",
            duration: entranceDuration,
            stagger: staggerSpeed,
        }, "<")

        // Wait for entrance animations to mostly complete, then unscramble
        tl.to(nameElement, {
            duration: 1.5,              // Unscramble duration
            ease: 'power2.out',         // Smooth reveal
            scrambleText: {
                text: originalText,      // Reveal the real text
                speed: 2,                // Speed of character changes
                chars: defaultChars,     // Use full character set for scrambling
                // revealDelay: 0.1,        // Small delay between each character reveal
                tweenLength: false,      // Don't animate length changes
            }
        }); // Start unscrambling before entrance fully completes


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
                AMARI : WYKING
            </Typography>
        </div>
    );
}