// Enhanced project type for showcase with additional display data
export interface ProjectShowcaseData {
  id: string;
  title: string;
  description: string;
  skills: string[];
  images: ProjectImage[];
  featured?: boolean;
  order?: number;
  project_end_date?: string;
}

// Project image with enhanced metadata for showcase
export interface ProjectImage {
  id: string;
  blob_url: string;
  caption?: string;
  alt_text?: string;
  order?: number;
}


// Project showcase component props
export interface ProjectShowcaseProps {
  projects: ProjectShowcaseData[];
}


export interface ProjectCardProps {
  project: ProjectShowcaseData;
}



export interface ProjectDetailsProps {
  description: string;
  isExpanded: boolean;
  wordLimit?: number;
}

export interface SkillCarouselProps {
  skillsData: string[];
  autoPlay?: boolean;
  className?: string;
}

