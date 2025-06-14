import { Project } from '@/app/types/resume';

interface ProjectCardProps {
  project: Project;
}


export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="w-full max-w-lg h-fit bg-white border border-gray-200 rounded-lg">
      <div className="p-5">
        <h5 className="mb-2 text-md font-kode-mono tracking-tight text-gray-900 ">{project.name}</h5>
        <p className="mb-3 font-work-sans text-sm text-gray-700 line-clamp-1">
          {project.description}
        </p>
      </div>
    </div>
  );
}