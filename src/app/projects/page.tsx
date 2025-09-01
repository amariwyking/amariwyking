import { createClient } from "@/utils/supabase/client";
import ProjectShowcase from "@/app/components/projects/ProjectShowcase";
import {
  transformProjectForShowcase,
  sampleProjects,
} from "@/app/lib/project-showcase-data";

export default async function Projects() {
  const supabase = createClient();
  const { data: projects } = await supabase.from("project").select();

  // Transform database projects to showcase format
  const showcaseProjects = projects?.length
    ? projects.map(transformProjectForShowcase)
    : sampleProjects; // Use sample data as fallback

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <ProjectShowcase projects={showcaseProjects} />
    </main>
  );
}
