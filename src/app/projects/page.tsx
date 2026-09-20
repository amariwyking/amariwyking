import ProjectShowcase from "@/app/components/projects/ProjectShowcase";
import { getProjects } from "@/sanity/lib/fetch";

export default async function Projects() {
  const projects = await getProjects();

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <ProjectShowcase projects={projects} />
    </main>
  );
}
