"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { resumeData } from '@/app/lib/resume-data';
import { projectData } from '@/app/lib/project-data';
import { ResumePage } from '@/app/types/resume';
import PersonalIntro from '../landing/PersonalIntro';
import ProjectCard from './ProjectCard';
import SectionTitle from "../landing/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

interface ResumeInteractiveProps {
  data?: ResumePage;
}

export default function ResumeInteractive({ data = resumeData }: ResumeInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    const visionSection = visionRef.current;
    const missionSection = missionRef.current;
    const projectsSection = projectsRef.current;
    const experienceSection = experienceRef.current;

    if (!container || !visionSection || !missionSection || !projectsSection || !experienceSection) return;

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
      .addLabel("missionAnimation")
      .to(".mission-content",
        { opacity: 0, y: -50, duration: 0.5 },
        "+=0.5"
      );

    // Projects Section - Card Stack Animation
    const time = 2;
    const projectCards = gsap.utils.toArray('.project-card');
    
    // Set initial 3D properties for cards
    gsap.set(projectCards, {
      transformStyle: "preserve-3d",
      transformPerspective: 1000,
      transformOrigin: "center top"
    });

    const projectsTl = gsap.timeline({
      scrollTrigger: {
        trigger: projectsSection,
        start: "top top",
        end: `+=${window.innerHeight}px top`,
        scrub: true,
        pin: true,
        pinSpacing: true,
      }
    });

    // Phase 1: Cards animate in from right with 3D rotation
    projectsTl.from(projectCards, {
      opacity: 0,
      x: () => window.innerWidth,
      rotationY: -100,
      duration: time / 2,
      stagger: time
    });

    // Phase 2: All cards except last one scale down and fade
    projectsTl.to(
      projectCards.slice(0, -1), // All except last
      {
        opacity: 0,
        scale: 0.9,
        duration: time / 2,
        stagger: {
          each: time
        }
      },
      time // Start when first phase completes
    );

    // Phase 3: Move scaled cards left off-screen
    projectsTl.to(
      projectCards.slice(0, -1), // All except last
      {
        x: () => -window.innerWidth,
        rotationY: 100,
        duration: time,
        stagger: {
          each: time
        }
      },
      time + 0.2
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
    <div ref={containerRef} className="resume-interactive overflow-x-hidden">
      <div id="resume-wrapper" className="relative">
        {/* Intro Section */}
        <section
          ref={introRef}
          className="resume-section intro-section min-h-screen flex items-center justify-center relative"
        >
          <SectionTitle title="Intro" />
          <PersonalIntro />
        </section>

        {/* Vision Section */}
        <section
          ref={visionRef}
          className="resume-section vision-section min-h-screen flex items-center justify-center relative"
        >
          <SectionTitle title="Vision" />
          <div className="vision-content max-w-5xl mx-auto px-8 text-center">
            <p className="font-work-sans text-xl md:text-4xl text-gray-600 leading-relaxed">
              A global society that empowers <span className="keyword">all</span> of its people to <span className="keyword">contribute</span> <span className="keyword">intellectually</span> and <span className="keyword">culturally</span> to human achievement.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section
          ref={missionRef}
          className="resume-section mission-section min-h-screen flex items-center justify-center relative"
        >
          <SectionTitle title="Mission" />
          <div className="mission-content max-w-5xl mx-auto px-8 text-center">
            <p className="font-work-sans text-xl md:text-4xl text-gray-600 leading-relaxed">
              Leverage my skillset in support of the deployment of data-centric technologies that bolster the sustainability of urban life in sub-Saharan Africa.
            </p>
          </div>
        </section>

        {/* Projects Section */}
        <section
          ref={projectsRef}
          className="resume-section projects-section min-h-screen flex items-center justify-center relative"
        >
          <SectionTitle title="Projects" />
          <div className="projects-content w-full px-8">
            <div className="projects-stack relative w-full h-[60vh] flex items-center justify-center">
            {/* Card stack container - using CSS Grid to stack cards */}
              <div className="grid w-full max-w-2xl h-fit" style={{ gridTemplateAreas: '"stack"' }}>
                {projectData.map((project, index) => (
                  <div
                    key={index}
                    className="project-card"
                    style={{ gridArea: 'stack' }}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section
          ref={experienceRef}
          className="resume-section experience-section min-h-screen flex items-center justify-center relative"
        >
          <SectionTitle title="Experience" />
          <div className="subsections w-full">
            {data.experience.map((job, index) => (
              <div key={`${job.employer}-${index}`} className="experience-item absolute inset-0 flex items-center justify-center px-8">
                <div className="max-w-5xl mx-auto w-full">
                  <p className="text-xl sm:text-3xl md:text-5xl font-kode-mono font-bold text-gray-600 mb-3 leading-tight">
                    {job.employer}
                  </p>
                  <p className="text-md sm:text-xl md:text-2xl font-kode-mono text-green-600 font-medium mb-2">
                    {job.role}
                  </p>
                  <p className="text-md sm:text-lg md:text-xl font-kode-mono font-normal text-gray-400 mb-6">
                    {formatDate(job.tenure[0])} - {formatDate(job.tenure[1])}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {job.notes.map((note, noteIndex) => (
                      <li key={noteIndex} className="text-sm sm:text-lg md:text-xl font-work-sans text-gray-600 leading-relaxed flex items-start">
                        <span className="mr-4 text-lg shrink-0">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>

                  <div>
                    <p className="text-sm sm:text-lg font-kode-mono font-[400] text-gray-600 mb-4">
                      Technologies & Skills
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {job.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="skill-tag font-kode-mono px-2 py-1 sm:px-4 sm:py-2 text-gray-500 text-xs sm:text-sm font-medium border border-gray-200"
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