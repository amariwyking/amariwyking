import ResumeInteractive from "../resume/ResumeInteractive";
import { resumeData as experienceData } from "@/app/lib/resume-data";
import { ProjectShowcaseData } from "@/app/types/project-showcase";

interface LandingPageProps {
  projectData: ProjectShowcaseData[];
}

export default function LandingPage({ projectData }: LandingPageProps) {
  return (
    <div>
      <ResumeInteractive experienceData={experienceData} projectData={projectData}/>
    </div>
  );
}
