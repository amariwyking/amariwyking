"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ProjectShowcaseProps } from "@/app/types/project-showcase";
import ProjectCard, { getProjectCardTimeline } from "./ProjectCard";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.normalizeScroll(true);

export default function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  useGSAP(() => {
    // Clear previous ScrollTriggers
    ScrollTrigger.getAll().forEach((st) => st.kill());

    // Create ScrollTrigger for each project section
    const projectSections = gsap.utils.toArray(".project-section");

    projectSections.forEach((section: any) => {
      // Find the root element of the child card within this section
      const projectCardElement = section.querySelector(".project-card");

      if (projectCardElement) {
        // Get the complete animation timeline from the new function
        const childTimeline = getProjectCardTimeline(projectCardElement);

        ScrollTrigger.create({
          trigger: section,
          snap: {
            snapTo: "labels",
            duration: { min: 0.5, max: 1 },
            ease: "power2.inOut",
          },
          start: "top 60%",
          animation: childTimeline,
          onEnterBack: (self) => {
            if (!self.isActive) {
              self.kill();
            }
          },
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [projects]);

  if (projects.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-kode-mono">
          No projects to display
        </p>
      </section>
    );
  }

  return (
    <section className="project-showcase">
      {projects.map((project) => (
        <div
          key={project.id}
          className="project-section w-full min-h-svh flex items-center px-6 sm:px-12 lg:px-24 py-8"
        >
          <ProjectCard project={project} />
        </div>
      ))}
    </section>
  );
}
