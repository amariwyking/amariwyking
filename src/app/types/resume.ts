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

export interface Project {
  name: string;
  description: string;
  projectLink?: string;
  imageLink?: string;
  techStack: Skill[];
}
