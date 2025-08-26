import { Project } from '@/app/types/resume';

interface ProjectCardProps {
  project: Project;
}


export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="px-6 sm:px-12">
      <div className="card-content w-full aspect-[4/5] md:aspect-[3/2] max-w-2xl px-4 sm:px-8 py-6 sm:py-12 bg-card font-kode-mono ring-4 ring-border flex flex-col justify-start">
        <h5 className="text-md md:text-xl font-bold text-card-foreground tracking-wider ">
          {project.name}
        </h5>
        <div className="w-full h-[2px] my-2 sm:my-6 md:bg-border text-card-foreground"></div>
        <p className="font-work-sans text-md md:text-base tracking-tighter">
          {project.description}
        </p>
      </div>
    </div>
  );
}