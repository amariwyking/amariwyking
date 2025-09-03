import ResumeInteractive from "@/app/components/resume/ResumeInteractive";
import { resumeData } from "@/app/lib/resume-data";
import { sampleProjects } from "../lib/project-showcase-data";

export default function InteractiveResumePage() {
  return (
    <div className="col-span-2">
      <ResumeInteractive
        projectData={sampleProjects}
        experienceData={resumeData}
      />
    </div>
  );
}
