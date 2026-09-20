import LandingPageWrapper from "./components/landing/LandingPageWrapper";
import { getProjects } from "@/sanity/lib/fetch";

export default async function Home() {
  const projects = await getProjects();

  return <LandingPageWrapper projectData={projects} />;
}
