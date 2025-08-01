"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ExperienceEntry } from '@/app/types/resume';

gsap.registerPlugin(ScrollTrigger);

interface ExperienceSectionProps {
  experience: ExperienceEntry;
  index: number;
  className?: string;
}

export default function ExperienceSection({ experience, index, className = "" }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return "Present";
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <section 
      ref={sectionRef}
      className={`min-h-screen flex items-center py-24 px-8 relative overflow-hidden ${className}`}
    >
      Background decoration
      <div className="max-w-5xl mx-auto w-full relative z-10">
        <div className="exp-header mb-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-6xl text-gray-800 mb-3 leading-tight">
                {experience.role}
              </h1>
              <h2 className="text-2xl md:text-3xl text-gray-700 font- mb-2">
                {experience.employer}
              </h2>
              <h3 className="text-lg md:text-xl text-gray-600">
                {formatDate(experience.tenure[0])} – {formatDate(experience.tenure[1])}
              </h3>
            </div>
            
            {experience.employer && (
              <div className={`type-badge px-4 py-2 rounded-full text-white text-sm font-medium uppercase tracking-wider`}>
                {experience.employer}
              </div>
            )}
          </div>
        </div>

        <div className="mb-10">
          <ul className="space-y-6">
            {experience.notes.map((note, noteIndex) => (
              <li key={noteIndex} className="exp-note flex items-start text-lg md:text-xl text-gray-700">
                <span className="text-green-600 mr-4 mt-1 text-2xl shrink-0">•adfa</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-medium text-gray-700 mb-6">
            Technologies & Skills
          </h4>
          <div className="flex flex-wrap gap-3">
            {experience.skills.map((skill, skillIndex) => (
              <span
                key={skillIndex}
                className="skill-tag px-4 py-2 bg-white/80 backdrop-blur-xs text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:bg-white hover:scale-105 transition-all duration-200 cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}