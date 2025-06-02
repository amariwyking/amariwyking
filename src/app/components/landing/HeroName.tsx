"use client";

import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { SplitText } from 'gsap/SplitText';
import { Typography } from '@material-tailwind/react';
import { useRef } from 'react';



export default function HeroName() {
    useGSAP(() => {
        SplitText.create(".name", {
            type: "chars, words",
            wordDelimiter: " : ",
            wordsClass: "word++",
            charsClass: "char"
        })

        const staggerSpeed = 0.1;

        gsap.from(".word1 .char", {
            opacity: 0,
            x: -100,
            y: 100,
            ease: "linear",
            duration: 1.0,
            stagger: -1 * staggerSpeed,
        })

        gsap.from(".word2 .char", {
            opacity: 0,
            x: 100,
            y: -100,
            ease: "ease",
            duration: 1.0,
            stagger: staggerSpeed,
        })
    })

    return (
        <div className="h-screen flex items-center justify-center">
            <Typography className="name font-bold text-center text-clip leading-tight tracking-normal text-gray-800 dark:text-gray-100 mx-auto my-6 w-full text-9xl">
                AMARI : WYKING
            </Typography>
        </div>

    )
}