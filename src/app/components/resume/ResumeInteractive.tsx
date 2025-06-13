"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Typography } from '@material-tailwind/react';
import { resumeData } from '@/app/lib/resume-data';
import { ResumePage } from '@/app/types/resume';
import PersonalIntro from '../landing/PersonalIntro';

gsap.registerPlugin(ScrollTrigger);

interface ResumeInteractiveProps {
  data?: ResumePage;
}

export default function ResumeInteractive({ data = resumeData }: ResumeInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    const visionSection = visionRef.current;
    const missionSection = missionRef.current;
    const experienceSection = experienceRef.current;

    if (!container || !visionSection || !missionSection || !experienceSection) return;

    // Clear previous ScrollTriggers
    ScrollTrigger.getAll().forEach(st => st.kill());

    // Vision Section - Pinned
    gsap.timeline({
      scrollTrigger: {
        trigger: visionSection,
        start: "top top",
        end: "+=100%",
        scrub: 1,
        pin: true,
        pinSpacing: true,
        snap: { snapTo: "labels" }
      }
    })
      .fromTo(".vision-content",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .addLabel("visionAnimation")
      .to(".vision-content",
        { opacity: 0, y: -50, duration: 0.5 },
        "+=0.5"
      );

    // Mission Section - Pinned
    gsap.timeline({
      scrollTrigger: {
        trigger: missionSection,
        start: "top top",
        end: "+=100%",
        scrub: 1,
        pin: true,
        pinSpacing: true,
        snap: { snapTo: "labels" }
      }
    })
      .fromTo(".mission-content",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .addLabel("visionAnimation")
      .to(".mission-content",
        { opacity: 0, y: -50, duration: 0.5 },
        "+=0.5"
      );

    // Experience Section - Pinned with multiple items
    const experienceItems = gsap.utils.toArray('.experience-item');
    const experienceCount = experienceItems.length;

    const experienceTl = gsap.timeline({
      scrollTrigger: {
        trigger: experienceSection,
        start: "top top",
        end: `+=${experienceCount * 100}%`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        snap: {
          snapTo: "labels",
          duration: { min: 0.5, max: 1 },
        }
      }
    });

    // Initial state - hide all items
    gsap.set(experienceItems, { opacity: 0, y: 100 });

    experienceItems.forEach((item: any, index) => {
      const isLast = index === experienceItems.length - 1;

      // Animate in
      experienceTl
        .to(item, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        }, index * 1);

      // Animate skill tags
      experienceTl.from(item.querySelectorAll('.skill-tag'), {
        scale: 0,
        opacity: 0,
        duration: 0.2,
        stagger: 0.05,
        ease: "back.out(1.7)"
      }, index * 1 + 0.2);

      experienceTl.addLabel(`experienceAnimationGroup${index}`)

      // Animate out (except for last item)
      if (!isLast) {
        experienceTl.to(item, {
          opacity: 0,
          y: -100,
          duration: 0.3,
          ease: "power2.in"
        }, index * 1 + 0.7);
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [data]);

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
          ref={visionRef}
          className="resume-section vision-section min-h-screen flex items-center justify-center relative"
        >
          <div className="section-title font-kode-mono absolute top-8 left-8 text-6xl md:text-8xl font-extralight text-gray-800 opacity-20 pointer-events-none">
            Intro
          </div>
          <PersonalIntro />
        </section>
        {/* Vision Section */}
        <section
          ref={visionRef}
          className="resume-section vision-section min-h-screen flex items-center justify-center relative"
        >
          <div className="section-title font-kode-mono absolute top-8 left-8 text-6xl md:text-8xl font-extralight text-gray-800 opacity-20 pointer-events-none">
            Vision
          </div>
          <div className="vision-content max-w-5xl mx-auto px-8 text-center">
            <Typography variant="h1" className=" text-4xl md:text-6xl text-gray-800 mb-8 leading-tight">
              Vision
            </Typography>
            <Typography variant="lead" className="font-work-sans text-xl md:text-2xl text-gray-700 leading-relaxed">
              {data.vision.visionStatement}
            </Typography>
          </div>
        </section>

        {/* Mission Section */}
        <section
          ref={missionRef}
          className="resume-section mission-section min-h-screen flex items-center justify-center relative"
        >
          <div className="section-title font-kode-mono absolute top-8 left-8 text-6xl md:text-8xl font-extralight text-gray-800 opacity-20 pointer-events-none">
            Mission
          </div>
          <div className="mission-content max-w-5xl mx-auto px-8 text-center">
            <Typography variant="h1" className="text-4xl md:text-6xl font-light text-gray-800 mb-8 leading-tight">
              Mission
            </Typography>
            <Typography variant="lead" className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              {data.mission.missionStatement}
            </Typography>
          </div>
        </section>

        {/* Experience Section */}
        <section
          ref={experienceRef}
          className="resume-section experience-section min-h-screen flex items-center justify-center relative"
        >
          <div className="section-title font-kode-mono absolute top-8 left-8 text-6xl md:text-8xl font-extralight text-gray-800 opacity-20 pointer-events-none">
            Experience
          </div>
          <div className="subsections w-full">
            {data.experience.map((job, index) => (
              <div key={`${job.employer}-${index}`} className="experience-item absolute inset-0 flex items-center justify-center px-8">
                <div className="max-w-5xl mx-auto w-full">
                  <div className="mb-8">
                    <Typography variant="h2" className="text-3xl md:text-5xl font-light text-gray-800 mb-3 leading-tight">
                      {job.role}
                    </Typography>
                    <Typography variant="h3" className="text-xl md:text-2xl text-blue-600 font-medium mb-2">
                      {job.employer}
                    </Typography>
                    <Typography variant="h4" className="text-lg text-gray-500 mb-6">
                      {formatDate(job.tenure[0])} – {formatDate(job.tenure[1])}
                    </Typography>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {job.notes.map((note, noteIndex) => (
                      <li key={noteIndex} className="text-lg text-gray-600 leading-relaxed flex items-start">
                        <span className="text-blue-500 mr-4 text-lg shrink-0">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>

                  <div>
                    <Typography variant="h5" className="text-lg font-medium text-gray-700 mb-4">
                      Technologies & Skills
                    </Typography>
                    <div className="flex flex-wrap gap-3">
                      {job.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="skill-tag px-4 py-2 backdrop-blur-xs text-gray-700 rounded-full text-sm font-medium border border-gray-200 shadow-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}