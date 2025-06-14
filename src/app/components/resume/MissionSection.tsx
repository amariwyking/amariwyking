"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Typography } from '@material-tailwind/react';
import { Mission } from '@/app/types/resume';

gsap.registerPlugin(ScrollTrigger);

interface MissionSectionProps {
  mission: Mission;
  className?: string;
}

export default function MissionSection({ mission, className = "" }: MissionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Main section animation
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reset"
      },
      opacity: 0,
      scale: 0.95,
      duration: 1.5,
      ease: "power2.out"
    });

    // Title animation with split effect
    const title = section.querySelector('.mission-title');
    gsap.from(title, {
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        toggleActions: "play none none reset"
      },
      opacity: 0,
      x: -100,
      duration: 1.2,
      ease: "back.out(1.7)",
      delay: 0.3
    });

    // Statement animation
    const statement = section.querySelector('.mission-statement');
    gsap.from(statement, {
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none reset"
      },
      opacity: 0,
      x: 100,
      duration: 1.2,
      ease: "back.out(1.7)",
      delay: 0.6
    });

    // Floating animation on scroll
    gsap.to(section.querySelector('.mission-content'), {
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      },
      y: -30,
      ease: "none"
    });

  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`min-h-screen flex items-center py-20 px-8 ${className}`}
    >
      <div className="mission-content max-w-5xl mx-auto">
        <Typography 
          variant="h1" 
          className="mission-title text-5xl md:text-7xl font-light text-gray-800 mb-12 leading-tight"
        >
          Mission
        </Typography>
        <Typography 
          variant="lead" 
          className="mission-statement text-2xl md:text-3xl text-gray-700 leading-relaxed font-light tracking-wide"
        >
          To develop a skillset and network that will support the development of data-centric technologies that bolster the sustainability of urban life.
        </Typography>
      </div>
    </section>
  );
}