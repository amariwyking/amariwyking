import { Project } from '@/app/types/resume';

interface ProjectCardProps {
  project: Project;
}


export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="px-6 sm:px-12">
      <div className="card-content w-full aspect-[4/5] md:aspect-[3/2] max-w-2xl px-4 sm:px-8 py-6 sm:py-12 font-kode-mono text-green-600 ring-4 ring-green-600 flex flex-col justify-start">
        <h5 className="text-md md:text-xl font-bold tracking-wider ">
          {project.name}
        </h5>
        <div className="w-full h-[2px] my-2 bg-green-600"></div>
        <p className="text-sm md:text-base tracking-tighter line-clamp-2">
          {project.description}
        </p>
      </div>
    </div>
  );
}