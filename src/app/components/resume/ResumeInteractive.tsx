"use client";

import { useRef } from "react";
import { resumeData } from "@/app/lib/resume-data";
import { projectData } from "@/app/lib/project-data";
import { ResumePage as ExperienceData } from "@/app/types/resume";
import PersonalIntro from "../landing/PersonalIntro";
import ProjectCard from "./ProjectCard";
import SectionTitle from "../landing/SectionTitle";
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
        <VisionSection />

        {/* Mission Section */}
        <MissionSection />

        {/* Projects Section */}
        <section
          ref={projectsRef}
          className="resume-section projects-section min-h-screen flex items-center justify-center relative"
        >
          <SectionTitle title="Projects" />
          <ProjectShowcase projects={props.projectData} />
        </section>

        {/* Experience Section */}
        <ExperienceSection experienceData={props.experienceData} />
      </div>
    </div>
  );
}
