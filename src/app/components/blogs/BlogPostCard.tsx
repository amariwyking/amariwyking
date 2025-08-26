"use client"

import { BlogCardProps as BlogPostCardProps } from "@/app/types/blogs";
import Link from "next/link";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Remove index requirement as ScrollTrigger handles timing naturally

const formatDate = (dateStr: string) => {
    // Create the UTC date
    const utcDate = new Date(dateStr);

    const estDate = new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate(),
        utcDate.getUTCHours(),
        utcDate.getUTCMinutes(),
        utcDate.getUTCSeconds()
      );

    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/New_York',
        dateStyle: 'long',
    };
    const formattedDate: string = estDate.toLocaleDateString('en-US', options);

    return formattedDate;
}

export default function BlogPostCard(props: BlogPostCardProps) {
    const blog = props.blog;
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const gradientBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const container = containerRef.current;
        const shadow = shadowRef.current;
        const gradientBar = gradientBarRef.current;
        
        if (!card || !container || !shadow || !gradientBar) return;


        // Set initial states for entrance animation
        gsap.set(container, {
            opacity: 0,
            x: 50
        });

        // Set hover states
        gsap.set(shadow, { 
            opacity: 0.1,
            scale: 1,
            y: 2
        });


        // ScrollTrigger entrance animation
        ScrollTrigger.create({
            trigger: container,
            start: "top 80%", // When card top reaches viewport center
            onEnter: () => {
                gsap.to(container, {
                    opacity: 1,
                    x: 0,
                    duration: 1.4,
                    ease: "power2.out"
                });
            }
        });

        const handleMouseEnter = () => {
            // Kill any existing animations to prevent conflicts
            gsap.killTweensOf([card, shadow, gradientBar]);
            
            // Skip computed styles for better performance and compatibility
            
            // Create a timeline for coordinated animations
            const tl = gsap.timeline();
            
            // Card lift and scale effect
            tl.to(card, {
                scale: 1.02,
                y: -8,
                rotationX: 2,
                transformPerspective: 1000,
                duration: 0.4,
                ease: "power2.out"
            }, 0)
            
            // Subtle shadow effect
            .to(shadow, {
                opacity: 0.15,
                scale: 1,
                y: 4,
                duration: 0.4,
                ease: "power2.out"
            }, 0)
            
            // Accent bar enhancement
            .to(gradientBar, {
                scaleX: 1,
                height: "4px",
                duration: 0.3,
                ease: "power2.out"
            }, 0);
        };

        const handleMouseLeave = () => {
            // Kill any existing animations
            gsap.killTweensOf([card, shadow, gradientBar]);
            
            // Create return animation timeline
            const tl = gsap.timeline();
            
            // Return card to original position
            tl.to(card, {
                scale: 1,
                y: 0,
                rotationX: 0,
                duration: 0.3,
                ease: "power2.out"
            }, 0)
            
            // Return shadow to original state
            .to(shadow, {
                opacity: 0.1,
                scale: 1,
                y: 2,
                duration: 0.3,
                ease: "power2.out"
            }, 0)
            
            // Return accent bar
            .to(gradientBar, {
                scaleX: 1,
                height: "4px",
                duration: 0.2,
                ease: "power2.out"
            }, 0);
        };


        // Add event listeners
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup function
        return () => {
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
            gsap.killTweensOf([container, card, shadow, gradientBar]);
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === container) {
                    trigger.kill();
                }
            });
        };
    }, []);

    return (
        <div className="group flex flex-row mb-8 lg:mb-12">
            <div className="card-date basis-48 lg:py-10 lg:mr-10 text-muted-foreground font-kode-mono font-light hidden md:block">
                <p className="text-right leading-relaxed text-sm lg:text-base">
                    {formatDate(blog.date)}
                </p>
            </div>
            <div ref={containerRef} className="card-container flex-1 max-w-2xl relative">
                {/* Subtle shadow */}
                <div ref={shadowRef} className="absolute inset-0 bg-black/5 rounded-2xl transform translate-y-2"></div>
                
                <div ref={cardRef} className="relative bg-card border border-border rounded-sm shadow-sm overflow-hidden">
                    {/* Accent bar */}
                    <div ref={gradientBarRef} className="h-1.5 bg-primary"></div>
                    
                    {/* Card content */}
                    <div className="relative bg-card p-6 lg:p-10">
                        
                        <div className="relative z-10">
                            {/* Mobile date display */}
                            <div className="md:hidden mb-4">
                                <p className="text-xs font-kode-mono text-muted-foreground/80 leading-relaxed">
                                    {formatDate(blog.date)}
                                </p>
                            </div>
                            
                            <div className="card-body mb-8">
                                <h3 ref={titleRef} className="card-title text-lg font-work-sans font-bold tracking-wide lg:text-xl text-card-foreground mb-4 leading-tight">
                                    {blog.title}
                                </h3>
                                <p className="card-description text-sm line-clamp-3 text-muted-foreground font-work-sans lg:text-base leading-relaxed">
                                    {blog.description}
                                </p>
                            </div>
                            
                            <div className="card-footer">
                                <Link href={`/blog/${blog.slug}`}>
                                    <div className="card-link inline-flex items-center px-5 py-3 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors duration-300 border border-border hover:border-primary/50">
                                        <p className="text-sm lg:text-base font-kode-mono font-medium">Read More</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}