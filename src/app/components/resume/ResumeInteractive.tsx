"use client";

import { useRef } from "react";
import { resumeData } from "@/app/lib/resume-data";
import { projectData } from "@/app/lib/project-data";
import { ResumePage as ExperienceData } from "@/app/types/resume";
import PersonalIntro from "../landing/PersonalIntro";
import ProjectCard from "./ProjectCard";
import VerticalSectionIndicator from "../shared/VerticalSectionIndicator";
import { ProjectShowcaseData } from "@/app/types/project-showcase";
import ProjectShowcase from "../projects/ProjectShowcase";
import VisionSection from "./VisionSection";
import MissionSection from "./MissionSection";
import ExperienceSection from "./ExperienceSection";

interface ResumeInteractiveProps {
  experienceData: ExperienceData;
  projectData: ProjectShowcaseData[];
}

export default function ResumeInteractive(props: ResumeInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);

  // Define sections for the vertical indicator
  const sections = [
    { id: "intro", name: "intro", displayName: "Intro" },
    { id: "vision", name: "vision", displayName: "Vision" },
    { id: "mission", name: "mission", displayName: "Mission" },
    { id: "projects", name: "projects", displayName: "Projects" },
    { id: "experience", name: "experience", displayName: "Experience" },
  ];

  return (
    <div ref={containerRef} className="resume-interactive overflow-x-hidden">
      <div id="resume-wrapper" className="relative">
        {/* Vertical Section Navigation */}
        <VerticalSectionIndicator sections={sections} />

        {/* Intro Section */}
        <section
          id="intro"
          ref={introRef}
          className="resume-section intro-section min-h-screen flex items-center justify-center relative"
        >
          <PersonalIntro />
        </section>

        {/* Vision Section */}
        <VisionSection />

        {/* Mission Section */}
        <MissionSection />

        {/* Projects Section */}
        <section
          id="projects"
          ref={projectsRef}
          className="resume-section projects-section min-h-screen flex items-center justify-center relative"
        >
          <ProjectShowcase projects={props.projectData} />
        </section>

        {/* Experience Section */}
        <ExperienceSection experienceData={props.experienceData} />
      </div>
    </div>
  );
}
