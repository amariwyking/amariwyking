export type Vision = {
  visionStatement: string;
};

export type Mission = {
  missionStatement: string;
};

export type Skill =
  | 'Python'
  | 'Java'
  | 'C++'
  | 'Objective-C'
  | 'Swift'
  | 'TypeScript'
  | 'JavaScript'
  | 'React.js'
  | 'Next.js'
  | 'GSAP'
  | 'Plotly Dash'
  | 'Git version control'
  | 'Node.js'
  | 'Design Systems'
  | 'Object-oriented Programming'
  | 'Game Design'
  | 'Data Visualization'
  | 'Deep learning'
  | 'Computer Vision'
  | 'Natural language processing'
  | 'Geographic information systems'
  | 'Google Earth Engine'
  | 'Android'
  | 'Material Design'
  | 'Firebase'
  | 'ML Kit'
  | 'Parse'
  | 'Minecraft'
  | 'Electric Vehicle'
  | 'Battery Simulation'
  | 'TailwindCSS'
  | 'HTML/CSS'
  | 'REST APIs'
  | 'GraphQL'
  | 'MongoDB'
  | 'PostgreSQL'
  | 'Docker'
  | 'AWS'
  | 'CI/CD'
  | 'Anaconda'
  | 'Dask'
  | 'High-performance computing'
  | 'Mercurial'
  | 'Undux';

export type ExperienceEntry = {
  employer: string;
  role: string;
  tenure: [Date, Date | null]; // start and end date, null for current positions
  notes: string[]; // bullet points or summary
  skills: Skill[]; // list of associated tags
  type?: 'work' | 'project' | 'education'; // categorization for filtering
};

export interface Project {
  name: string;
  description: string;
  projectLink?: string;
  imageLink?: string;
  techStack: Skill[];
}

export type ResumePage = {
  experience: ExperienceEntry[];
};
