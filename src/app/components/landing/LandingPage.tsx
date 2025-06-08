import PersonalIntro from "./PersonalIntro";
import ResumeInteractive from "../resume/ResumeInteractive";
import { resumeData } from "@/app/lib/resume-data";

export default function LandingPage() {
  return (
    <div>
      <ResumeInteractive data={resumeData} />
    </div>
  );
}