import ResumeInteractive from "@/app/components/resume/ResumeInteractive";
import { resumeData } from "@/app/lib/resume-data";
import { getProjects } from "@/sanity/lib/fetch";

export default async function InteractiveResumePage() {
  const projects = await getProjects();

  return (
    <div className="col-span-2">
      <ResumeInteractive projectData={projects} experienceData={resumeData} />
    </div>
  );
}
