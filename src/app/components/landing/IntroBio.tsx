'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

export default function IntroBio() {
    const containerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (containerRef.current) {
            const paragraphs = containerRef.current.querySelectorAll('p')
            const splits = Array.from(paragraphs).map(p => new SplitText(p, { type: 'lines, words' }))

            splits.forEach(split => {
                split.lines.forEach(line => {
                    const wordsInLine = new SplitText(line, { type: 'words' })
                    gsap.fromTo(
                        wordsInLine.words,
                        { x: 100, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: 'power2.inOut',
                            delay: 0.75,
                            stagger: 0.05,
                        }
                    )
                })
            })
        }
    }, [])

    return (
        <div ref={containerRef} className="md:justify-self-start mx-0 sm:mx-auto col-span-1 md:col-span-2 order-3">
            <p className="font-work-sans mx-8 sm:mx-8 md:mx-auto mt-6 text-left text-foreground text-sm md:text-lg lg:text-2xl ">
                I&apos;m a software engineer with a strong focus on data-driven systems and urban technology. My background spans full-stack development, mobile applications, and machine learning, shaped by industry experience at leading tech companies and graduate research at the NYU Center for Urban Science + Progress.
            </p>
            <br />
            <p className="font-work-sans mx-8 sm:mx-8 md:mx-auto text-left text-foreground text-sm md:text-lg lg:text-2xl ">
                I bring a product-oriented mindset to technical challenges and hold a particular interest in learning how to build scalable tools that support complex systems. Whether it be digital products or researching urban problems, I love digging into problems that sit at the edge of software, data, and the real world.
            </p>
        </div >

    )
}