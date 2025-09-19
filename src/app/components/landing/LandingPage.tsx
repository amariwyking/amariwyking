import ResumeInteractive from "../resume/ResumeInteractive";
import { resumeData as experienceData } from "@/app/lib/resume-data";
import { ProjectShowcaseData } from "@/app/types/project-showcase";
import Navigation from "../shared/Navigation";

interface LandingPageProps {
  projectData: ProjectShowcaseData[];
}

export default function LandingPage({ projectData }: LandingPageProps) {
  return (
    <>
      <Navigation />
      <div>
        <ResumeInteractive experienceData={experienceData} projectData={projectData}/>
      </div>
    </>
  );
}
