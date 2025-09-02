import { createServerSideClient } from "@/utils/supabase/server";
import LandingPageWrapper from "./components/landing/LandingPageWrapper";
import {
  sampleProjects,
  transformProjectForShowcase,
} from "./lib/project-showcase-data";
import ProjectShowcase from "./components/projects/ProjectShowcase";

export default async function Home() {
  const supabase = await createServerSideClient();
  const { data: projects } = await supabase.from("project").select();

  // Transform database projects to showcase format
  const showcaseProjects = projects?.length
    ? projects.map(transformProjectForShowcase)
    : sampleProjects; // Use sample data as fallback

  return (
    <>
      <LandingPageWrapper projectData={showcaseProjects} />
    </>
  );
}
