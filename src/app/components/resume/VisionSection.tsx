"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Typography } from '@material-tailwind/react';
import { Vision } from '@/app/types/resume';

gsap.registerPlugin(ScrollTrigger);

interface VisionSectionProps {
  vision: Vision;
  className?: string;
}

export default function VisionSection({ vision, className = "" }: VisionSectionProps) {
  return (
    <section 
      className={`min-h-screen flex items-center py-20 px-8 ${className}`}
      style={{ backgroundSize: '200% 200%', backgroundPosition: '50% 0%' }}
    >
      <div className="max-w-5xl mx-auto">
        <Typography 
          variant="h1" 
          className="vision-text text-5xl md:text-7xl font-light text-gray-800 mb-12 leading-tight"
        >
          Vision
        </Typography>
        <Typography 
          variant="lead" 
          className="vision-text text-2xl md:text-3xl text-gray-700 leading-relaxed font-light tracking-wide"
        >
          A global society that empowers <span className="text-green-400">all</span> of its people to contribute intellectually and culturally to human achievement.
        </Typography>
      </div>
    </section>
  );
}