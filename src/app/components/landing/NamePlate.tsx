"use client";

import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@civic/auth/react';
import { UserButton } from '@civic/auth/react'

// Register GSAP plugins
gsap.registerPlugin(ScrambleTextPlugin, SplitText);

// Character set for scrambling 
const defaultChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export default function NamePlate() {
    // Initialize a state variable to track visibility of the auth login button
    const [authIsVisible, setAuthIsVisible] = useState<boolean>(false);

    // Ref to track the paragraph element
    const nameRef = useRef<HTMLDivElement>(null);

    // Ref to store SplitText instance for cleanup
    const splitTextRef = useRef<SplitText | null>(null);

    // Original text content
    const originalText = "AMARI WYKING GARRETT";

    // Ref to select the auth button element
    const authRef = useRef<HTMLDivElement>(null);

    // Ref to store the *persistent* auth animation timeline
    const authTimelineRef = useRef<gsap.core.Timeline | null>(null);


    // GSAP animations setup for name plate and initial scramble
    useGSAP(() => {
        const nameElement = nameRef.current;
        if (!nameElement) return;

        const splitInstance = SplitText.create(nameElement, {
            type: "chars, words",
            wordsClass: "word++",
            charsClass: "char"
        });

        const firstName = nameElement.querySelector('.word1') as HTMLParagraphElement;

        const handleClick = (event: MouseEvent) => {
            setAuthIsVisible(prevIsVisible => !prevIsVisible);
        }

        splitTextRef.current = splitInstance;

        const chars = nameElement.querySelectorAll('.char');

        console.log(chars)

        firstName?.addEventListener('click', handleClick);

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

    // useGSAP for initializing the auth animation timeline (runs once)
    useGSAP(() => {
        const authElement = authRef.current;
        if (!authElement) return;


        // Create the timeline, initially hidden/reversed
        const tl = gsap.timeline({ paused: true, reversed: true }); // Start reversed
        tl.to(authElement, {
            duration: 0.5, // Shorter duration for quick toggle
            opacity: 1.0,
            x: 0, // Assume it might slide in/out
            ease: "power2.inOut"
        });

        // Store the timeline instance in the ref
        authTimelineRef.current = tl;

        // Set initial state for auth element (hidden)
        gsap.set(authElement, { opacity: 0, x: -20, visibility: 'hidden' });

    }, { scope: authRef, dependencies: [] });

    // useEffect to control the auth animation timeline based on authIsVisible state
    useEffect(() => {
        if (authTimelineRef.current) {
            authTimelineRef.current.reversed(!authIsVisible);
        }
    }, [authIsVisible]);

    useEffect(() => {
        if (authTimelineRef.current) {
            if (authIsVisible) {
                authTimelineRef.current.play();
            } else {
                authTimelineRef.current.reverse();
            }
        }
    }, [authIsVisible]);


    return (
        <div className="flex flex-row order-1">

            <p
                ref={nameRef}
                className="name w-full font-kode-mono font-medium text-center sm:text-left leading-[1.15] tracking-normal text-green-600 text-4xl md:text-7xl lg:text-9xl"
                aria-level={1}
                aria-label="Amari Wyking Garrett"
            >
                AMARI WYKING GARRETT
            </p>
            {/* The auth div, controlled by the timeline */}
            <div ref={authRef} className="mt-4">
                <UserButton className="userButton w-fit rounded-sm border-2 border-amber-300" />
            </div>
        </div>
    );
}