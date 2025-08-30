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

  // GSAP Animation
  useGSAP(() => {
    if (!containerRef.current || !autoPlay) return;

    const initLoop = () => {
      if (!checkAnimationNeeded()) return;

      const skills = gsap.utils.toArray(containerRef.current!.querySelectorAll('.skill'));
      if (skills.length === 0) return;

      const loop = horizontalLoop(skills, {
        paused: false, // Start playing right away
        speed: 0.25,
        repeat: -1,
        paddingRight: 8,
      });
      
      loopRef.current = loop;
    };

    // Use a small delay to ensure the DOM is fully rendered and widths are calculated correctly.
    const timeoutId = setTimeout(initLoop, 100);

    return () => {
      clearTimeout(timeoutId);
      if (loopRef.current) {
        loopRef.current.kill?.();
        loopRef.current = null;
      }
    };
  }, [autoPlay, checkAnimationNeeded]);


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