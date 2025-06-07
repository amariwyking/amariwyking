"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Typography } from '@material-tailwind/react';
import { resumeData } from '@/app/lib/resume-data';
import { ResumePage } from '@/app/types/resume';

gsap.registerPlugin(ScrollTrigger);

interface ResumeInteractiveProps {
  data?: ResumePage;
}

export default function ResumeInteractive({ data = resumeData }: ResumeInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);

  // Helper function to add section refs
  const addToSectionRefs = (element: HTMLElement | null) => {
    if (element && !sectionsRef.current.includes(element)) {
      sectionsRef.current.push(element);
    }
  };

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous ScrollTriggers
    ScrollTrigger.getAll().forEach(st => st.kill());


    // Animate each resume section as it enters viewport
    sectionsRef.current.forEach((section, index) => {
      // Animate child elements with stagger
      const childElements = section.querySelectorAll('.animate-child');
      if (childElements.length > 0) {
        gsap.from(childElements, {
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none none"
          },
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3
        });
      }
    });

    // Skill tags animation
    gsap.utils.toArray('.skill-tag').forEach((tag: any) => {
      gsap.from(tag, {
        scrollTrigger: {
          trigger: tag.closest('.resume-section'),
          start: "top 60%",
          toggleActions: "play none none reset"
        },
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
        delay: 0.8
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "Present";
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div ref={containerRef} className="resume-interactive">
      <div id="resume-wrapper" className="relative">
        {/* Vision Section */}
        <section 
          ref={addToSectionRefs}
          className="resume-section min-h-screen flex items-center py-20 px-8 bg-white"
        >
          <div className="max-w-4xl mx-auto">
            <Typography variant="h2" className="animate-child text-4xl md:text-6xl font-light text-gray-800 mb-8">
              Vision
            </Typography>
            <Typography variant="lead" className="animate-child text-xl md:text-2xl text-gray-600 leading-relaxed">
              {data.vision.visionStatement}
            </Typography>
          </div>
        </section>

        {/* Mission Section */}
        <section 
          ref={addToSectionRefs}
          className="resume-section min-h-screen flex items-center py-20 px-8"
        >
          <div className="max-w-4xl mx-auto">
            <Typography variant="h2" className="animate-child text-4xl md:text-6xl font-light text-gray-800 mb-8">
              Mission
            </Typography>
            <Typography variant="lead" className="animate-child text-xl md:text-2xl text-gray-600 leading-relaxed">
              {data.mission.missionStatement}
            </Typography>
          </div>
        </section>

        {/* Experience Sections */}
        {data.experience.map((job, index) => (
          <section
            key={`${job.employer}-${index}`}
            ref={addToSectionRefs}
            className="resume-section experience min-h-screen flex items-center py-20 px-8"
          >
            <div className="max-w-4xl mx-auto w-full">
              <div className="animate-child mb-6">
                <Typography variant="h2" className="text-3xl md:text-5xl font-light text-gray-800 mb-2">
                  {job.role}
                </Typography>
                <Typography variant="h3" className="text-xl md:text-2xl text-blue-600 font-medium mb-4">
                  {job.employer}
                </Typography>
                <Typography variant="h4" className="text-lg text-gray-500">
                  {formatDate(job.tenure[0])} – {formatDate(job.tenure[1])}
                </Typography>
              </div>

              <ul className="animate-child space-y-4 mb-8">
                {job.notes.map((note, noteIndex) => (
                  <li key={noteIndex} className="text-lg text-gray-600 leading-relaxed flex items-start">
                    <span className="text-blue-500 mr-4 text-lg">•</span><span>{note}</span>
                  </li>
                ))}
              </ul>

              <div className="animate-child">
                <Typography variant="h5" className="text-lg font-medium text-gray-700 mb-4">
                  Technologies & Skills
                </Typography>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="skill-tag px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}