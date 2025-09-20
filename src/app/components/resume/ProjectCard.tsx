import { Project } from '@/app/types/resume';

interface ProjectCardProps {
  project: Project;
}


export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="card-content w-full aspect-[4/5] md:aspect-[3/2] max-w-2xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 bg-card font-kode-mono ring-4 ring-border flex flex-col justify-start">
        <h5 className="text-xl sm:text-3xl md:text-5xl font-kode-mono font-bold text-card-foreground leading-tight mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8">
          {project.name}
        </h5>
        <div className="w-full h-[2px] bg-border text-card-foreground mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8"></div>
        <p className="font-work-sans text-sm sm:text-lg md:text-xl leading-relaxed tracking-tighter">
          {project.description}
        </p>
      </div>
    </div>
  );
}