import ResumeInteractive from "@/app/components/resume/ResumeInteractive";
import { getExperience, getProjects } from "@/sanity/lib/fetch";

export default async function InteractiveResumePage() {
  const [projects, experience] = await Promise.all([
    getProjects(),
    getExperience(),
  ]);

  return (
    <div className="col-span-2">
      <ResumeInteractive projectData={projects} experienceData={experience} />
    </div>
  );
}
