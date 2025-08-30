"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SkillChip from './SkillChip';
import { horizontalLoop } from '@/utils/horizontalLoop';
import { SkillCarouselProps } from '@/app/types/project-showcase';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function SkillCarousel({
  skillsData,
  autoPlay = true,
  className = ''
}: SkillCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const loopRef = useRef<any>(null);

  // Check if animation is needed
  const checkAnimationNeeded = useCallback(() => {
    if (!containerRef.current) return false;

    const container = containerRef.current;
    const skillsContainer = container.querySelector('.skills-track');
    if (!skillsContainer) return false;

    const containerWidth = container.offsetWidth;
    const contentWidth = skillsContainer.scrollWidth;
    
    const needsAnimation = contentWidth > containerWidth;
    setShouldAnimate(needsAnimation);
    return needsAnimation;
  }, []);

  // GSAP ScrollTrigger implementation
  useGSAP(() => {
    if (!containerRef.current || !autoPlay) return;

    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      const needsAnimation = checkAnimationNeeded();
      if (!needsAnimation) return;

      // Select skill elements within this specific carousel
      const skills = gsap.utils.toArray(containerRef.current!.querySelectorAll('.skill'));
      
      if (skills.length === 0) return;

      // Create the horizontal loop with infinite repeat and spacing
      const loop = horizontalLoop(skills, { 
        paused: true, 
        speed: 0.25,
        repeat: -1,  // Infinite loop
        paddingRight: 8 // Add spacing between last and first element
      });
      
      loopRef.current = loop;

      // Create ScrollTrigger for viewport-based control
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom-=10%",
        end: "bottom top+=10%",
        onEnter: () => {
          if (autoPlay) {
            loop.play();
          }
        },
        onLeave: () => {
          loop.pause();
        },
        onEnterBack: () => {
          if (autoPlay) {
            loop.play();
          }
        },
        onLeaveBack: () => {
          loop.pause();
        }
      });
    });

    return () => {
      if (loopRef.current) {
        loopRef.current.kill?.();
        loopRef.current = null;
      }
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, [autoPlay]);


  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      checkAnimationNeeded();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkAnimationNeeded]);

  // If no skills, return nothing
  if (!skillsData.length) return null;

  return (
    <div
      ref={containerRef}
      className={`skill-carousel relative overflow-hidden ${className}`}
      aria-label="Skills carousel"
    >
      {/* Skills track - single container for all skills */}
      <div className="skills-track flex items-center px-1 gap-2 whitespace-nowrap">
        {skillsData.map((skill, index) => (
          <SkillChip key={`${skill}-${index}`} skill={skill} />
        ))}
      </div>

      {/* Gradient overlays for smooth edges - only show when animating */}
      {shouldAnimate && (
        <>
          <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </>
      )}
    </div>
  );
}