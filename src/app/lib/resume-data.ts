import { ResumePage } from '@/app/types/resume';

export const resumeData: ResumePage = {
  experience: [
    {
      employer: "Idaho National Laboratory",
      role: "Software Engineering Intern",
      tenure: [new Date("2024-05-01"), new Date("2024-08-31")],
      type: "work",
      notes: [
        "Developed dashboards to streamline visualization workflow for electric vehicle battery charge profiles, resulting in the identification of critical discrepancies in the simulated charging models",
        "Implemented temperature-aware battery simulation framework, improving model fidelity to match experimental observations of battery state during charge",
      ],
      skills: ["Python", "C++", "Data Visualization", "Plotly Dash"]
    },
    {
      employer: "Idaho National Laboratory",
      role: "Data Science Intern",
      tenure: [new Date("2023-05-01"), new Date("2023-08-31")],
      type: "work",
      notes: [
        "Implemented scalable data preprocessing workflow using Dask and high-performance computing to handle large multi-modal infrasound for anomaly detection model training",
        "Evaluated efficacy of LSTM networks vs support vector machines for detecting anomalous events in nuclear solvent extraction testbed",
      ],
      skills: ["Python", "Anaconda", "Dask", "High-performance computing", "Deep learning"]
    },
    {
      employer: "Apple",
      role: "Software Engineering Intern",
      tenure: [new Date("2022-05-01"), new Date("2022-08-31")],
      type: "work",
      notes: [
        "Prototyped cross-app photo sharing experience enabling Messages-based interaction with Photos app content",
        "Engineered storage architecture modifications allowing Messages app interaction while preserving zone-based privacy controls",
        "Designed inter-process communication system ensuring photo proliferation between Messages and Photos app subprocesses",
      ],
      skills: ["Objective-C", "Swift"]
    },
    {
      employer: "Meta",
      role: "Software Engineering Intern",
      tenure: [new Date("2021-05-01"), new Date("2021-08-31")],
      type: "work",
      notes: [
        "Developed configurable React.js visualization components enabling multi-experiment parameter analysis using Undux state management",
        "Built modular dashboard architecture supporting custom metric selection for machine learning optimization tradeoffs and constraint analysis",
      ],
      skills: ["TypeScript", "React.js", "Undux", "Design Systems", "Mercurial"]
    },
    {
      employer: "Meta",
      role: "Software Engineering Intern",
      tenure: [new Date("2020-05-01"), new Date("2020-08-31")],
      type: "work",
      notes: [
        "Developed native Android sustainability app in Java implementing Material Design system from concept to MVP",
        "Integrated Firebase Authentication and ML Kit barcode scanning with Parse backend for user content management ",
        "Architected full-stack CRUD operations enabling user-generated content creation, storage, and social sharing features",
      ],
      skills: ["Java", "Android", "Material Design", "Firebase", "MongoDB", "Computer Vision", "Parse", "REST APIs"]
    },
    {
      employer: "Microsoft",
      role: "Software Engineering Intern",
      tenure: [new Date("2018-06-01"), new Date("2018-08-31")],
      type: "work",
      notes: [
        "Analyzed and re-implemented mini-game functionality from the legacy Minecraft Console Edition to align with the overhauled architecture of the Minecraft Bedrock Edition",
        "Collaborated with cross-platform development teams to ensure consistent gameplay experience across multiple device platforms"
      ],
      skills: ["C++", "Game Design", "Object-oriented Programming"]
    },
  ]
};

// Helper functions for data manipulation
export const getExperienceByType = (type: 'work' | 'project' | 'education') => {
  return resumeData.experience.filter(exp => exp.type === type);
};

export const getExperienceBySkill = (skill: string) => {
  return resumeData.experience.filter(exp =>
    exp.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  );
};

export const getAllSkills = () => {
  const allSkills = resumeData.experience.flatMap(exp => exp.skills);
  return [...new Set(allSkills)].sort();
};

export const getCurrentExperience = () => {
  return resumeData.experience.filter(exp => exp.tenure[1] === null);
};