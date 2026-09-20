import LandingPageWrapper from "./components/landing/LandingPageWrapper";
import { getExperience, getProjects } from "@/sanity/lib/fetch";

export default async function Home() {
  const [projects, experience] = await Promise.all([
    getProjects(),
    getExperience(),
  ]);

  return (
    <LandingPageWrapper projectData={projects} experienceData={experience} />
  );
}
