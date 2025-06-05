"use client";

import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { SplitText } from 'gsap/SplitText';
import { Typography } from '@material-tailwind/react';
import { useRef } from 'react';



export default function IntroHook() {
    const suffixRef = useRef<HTMLSpanElement>(null);

    useGSAP(() => {
        let stHook = SplitText.create(".hook", { type: "words, lines" })
        // let stEllipsis = SplitText.create(".ellipsis", { type: "chars", smartWrap: true })
        let stSuffix = SplitText.create(".suffix", { type: "chars" })

        function suffixAnimation() {
            const suffixElement = suffixRef.current;
            if (!suffixElement) return;

            const suffixWidth = suffixElement.getBoundingClientRect().width;

            return gsap.timeline()
                .from(stSuffix.chars, {
                    opacity: 0,
                    x: 20,
                    y: 20,
                    ease: "expo",
                    duration: 1.0,
                    delay: 0.35,
                    stagger: 0.1
                })
                .from(stHook.lines, {
                    x: suffixWidth,
                    ease: "power2",
                    duration: 1.0
                }, "<");
        }

        const tlHumanist = gsap.timeline()
            .from(stHook.words[0], {
                opacity: 0,
                x: -100,
                ease: "ease",
                duration: 0.8,
            })
            .from(stHook.words[1], {
                opacity: 0,
                y: -50,
                ease: "ease",
                duration: 0.8,
            }, "-=0.6")
            .from(stHook.words[2], {
                opacity: 0,
                y: 50,
                ease: "ease",
                duration: 0.8,
            }, "-=0.6");

        const tlSuffix = suffixAnimation();
        if (tlSuffix) {
            tlHumanist.add(tlSuffix);
        }


    })

    return (
        <div className="order-1">
            <Typography className="hook font-bold text-center text-clip leading-tight tracking-normal text-gray-800 dark:text-gray-100 mx-auto my-6 w-full text-2xl lg:max-w-3xl lg:text-5xl">
                just another human<span ref={suffixRef} className="suffix text-gray-400 dark:text-gray-500 whitespace-nowrap">ist</span>
                <br />
                {/* <span className="ellipsis">•••</span> */}
                {/* <br />
                exploring data
                <br />
                building software
                <br />
                embracing life */}
            </Typography>
        </div>

    )
}