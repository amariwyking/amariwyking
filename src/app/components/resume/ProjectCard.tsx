import { Project } from '@/app/types/resume';

interface ProjectCardProps {
  project: Project;
}


export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="w-full h-fit max-w-lg py-6 px-12 font-kode-mono text-green-600 ring-4 ring-green-600">

      <h5 className="text-md md:text-xl font-bold tracking-wider ">
        {project.name}
      </h5>
      <div className="w-full h-[2px] my-2 bg-green-600"></div>
      <p className="text-sm md:text-base tracking-tighter  line-clamp-2">
        {project.description}
      </p>
    </div>
  );
}