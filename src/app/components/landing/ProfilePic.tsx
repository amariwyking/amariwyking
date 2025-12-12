'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function ProfilePic() {
    const containerRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 1, ease: 'power2.inOut' }
            )
        }
    }, [])

    return (
        <div className='flex items-center justify-center -order-1 md:-order-1'>
            <div ref={containerRef} className="relative w-48 md:w-64 lg:w-80 h-48 md:h-64 lg:h-80">
                <Image
                    className="w-full h-full object-cover"
                    src='/general_images/suited.jpg'
                    alt=""
                    fill
                />
                <div 
                    className="absolute inset-0 bg-background"
                    style={{
                        mask: "url('/image_frame.svg')",
                        maskSize: "contain",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                    }}
                />
            </div>
        </div>
    )
}