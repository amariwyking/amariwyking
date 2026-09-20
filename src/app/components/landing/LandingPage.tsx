import ResumeInteractive from "../resume/ResumeInteractive";
import { ProjectShowcaseData } from "@/app/types/project-showcase";
import type { EXPERIENCE_QUERYResult } from "../../../../sanity.types";
import Navigation from "../shared/Navigation";

interface LandingPageProps {
  projectData: ProjectShowcaseData[];
  experienceData: EXPERIENCE_QUERYResult;
}

export default function LandingPage({
  projectData,
  experienceData,
}: LandingPageProps) {
  return (
    <>
      <Navigation />
      <div>
        <ResumeInteractive experienceData={experienceData} projectData={projectData}/>
      </div>
    </>
  );
}
