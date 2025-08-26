'use client';

import Link from 'next/link';
import { PlusCircle } from 'iconoir-react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface NavigationItemProps {
    href: string;
    children: React.ReactNode;
}

function NavigationItem({ href, children }: NavigationItemProps) {
    const itemRef = useRef<HTMLParagraphElement>(null);
    const arrowRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const item = itemRef.current;
        const arrow = arrowRef.current;
        
        if (!item || !arrow) return;

        // Set initial arrow state
        gsap.set(arrow, { 
            opacity: 0, 
            x: -10,
            display: 'inline-block'
        });

        const handleMouseEnter = () => {
            gsap.killTweensOf(arrow);
            gsap.to(arrow, {
                opacity: 1,
                x: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        };

        const handleMouseLeave = () => {
            gsap.killTweensOf(arrow);
            gsap.to(arrow, {
                opacity: 0,
                x: -10,
                duration: 0.2,
                ease: "power2.in"
            });
        };

        item.addEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            item.removeEventListener('mouseenter', handleMouseEnter);
            item.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <p 
            ref={itemRef}
            className="text-xl font-medium text-foreground hover:text-primary transition-colors duration-200 cursor-pointer flex items-center gap-2"
        >
            <Link href={href} className="flex items-center gap-2">
                <span 
                    ref={arrowRef}
                    className="text-primary font-bold"
                    aria-hidden="true"
                >
                    &gt;
                </span>
                {children}
            </Link>
        </p>
    );
}

export default function Admin() {
    return (
        <section className="resume-section min-h-screen flex items-center justify-center">
            <div className="flex flex-col font-kode-mono items-center gap-8">
                <div className="flex flex-row items-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground">Add Content</h1>
                </div>
                <div className="flex flex-col gap-6 items-start">
                    <NavigationItem href="/gallery/upload">
                        Upload to Gallery
                    </NavigationItem>
                    <NavigationItem href="/projects/upload">
                        Upload a Project
                    </NavigationItem>
                </div>
            </div>
        </section>
    );
}