/**
 * One-off: seed the `experience` documents that used to live in
 * src/app/lib/resume-data.ts. Idempotent (createOrReplace on fixed _ids).
 *
 *   npx sanity exec scripts/seed-experience.ts --with-user-token
 *
 * Uses the logged-in Sanity CLI user's session for writes.
 */
import { getCliClient } from "sanity/cli";

type ExperienceSeed = {
  _id: string;
  employer: string;
  role: string;
  startDate: string;
  endDate: string | null;
  type: "work" | "project" | "education";
  notes: string[];
  skills: string[];
};

const entries: ExperienceSeed[] = [
  {
    _id: "experience-inl-2024",
    employer: "Idaho National Laboratory",
    role: "Software Engineering Intern",
    startDate: "2024-05-01",
    endDate: "2024-08-31",
    type: "work",
    notes: [
      "Developed dashboards to streamline visualization workflow for electric vehicle battery charge profiles, resulting in the identification of critical discrepancies in the simulated charging models",
      "Implemented temperature-aware battery simulation framework, improving model fidelity to match experimental observations of battery state during charge",
    ],
    skills: ["Python", "C++", "Data Visualization", "Plotly Dash"],
  },
  {
    _id: "experience-inl-2023",
    employer: "Idaho National Laboratory",
    role: "Data Science Intern",
    startDate: "2023-05-01",
    endDate: "2023-08-31",
    type: "work",
    notes: [
      "Implemented scalable data preprocessing workflow using Dask and high-performance computing to handle large multi-modal infrasound for anomaly detection model training",
      "Evaluated efficacy of LSTM networks vs support vector machines for detecting anomalous events in nuclear solvent extraction testbed",
    ],
    skills: ["Python", "Anaconda", "Dask", "High-performance computing", "Deep learning"],
  },
  {
    _id: "experience-apple-2022",
    employer: "Apple",
    role: "Software Engineering Intern",
    startDate: "2022-05-01",
    endDate: "2022-08-31",
    type: "work",
    notes: [
      "Prototyped cross-app photo sharing experience enabling Messages-based interaction with Photos app content",
      "Engineered storage architecture modifications allowing Messages app interaction while preserving zone-based privacy controls",
      "Designed inter-process communication system ensuring photo proliferation between Messages and Photos app subprocesses",
    ],
    skills: ["Objective-C", "Swift"],
  },
  {
    _id: "experience-meta-2021",
    employer: "Meta",
    role: "Software Engineering Intern",
    startDate: "2021-05-01",
    endDate: "2021-08-31",
    type: "work",
    notes: [
      "Developed configurable React.js visualization components enabling multi-experiment parameter analysis using Undux state management",
      "Built modular dashboard architecture supporting custom metric selection for machine learning optimization tradeoffs and constraint analysis",
    ],
    skills: ["TypeScript", "React.js", "Undux", "Design Systems", "Mercurial"],
  },
  {
    _id: "experience-meta-2020",
    employer: "Meta",
    role: "Software Engineering Intern",
    startDate: "2020-05-01",
    endDate: "2020-08-31",
    type: "work",
    notes: [
      "Developed native Android sustainability app in Java implementing Material Design system from concept to MVP",
      "Integrated Firebase Authentication and ML Kit barcode scanning with Parse backend for user content management",
      "Architected full-stack CRUD operations enabling user-generated content creation, storage, and social sharing features",
    ],
    skills: ["Java", "Android", "Material Design", "Firebase", "MongoDB", "Computer Vision", "Parse", "REST APIs"],
  },
  {
    _id: "experience-microsoft-2018",
    employer: "Microsoft",
    role: "Software Engineering Intern",
    startDate: "2018-06-01",
    endDate: "2018-08-31",
    type: "work",
    notes: [
      "Analyzed and re-implemented mini-game functionality from the legacy Minecraft Console Edition to align with the overhauled architecture of the Minecraft Bedrock Edition",
      "Collaborated with cross-platform development teams to ensure consistent gameplay experience across multiple device platforms",
    ],
    skills: ["C++", "Game Design", "Object-oriented Programming"],
  },
];

async function main() {
  const client = getCliClient({ apiVersion: "2026-09-19" });
  const tx = client.transaction();
  for (const { endDate, ...entry } of entries) {
    tx.createOrReplace({
      _type: "experience",
      ...entry,
      ...(endDate ? { endDate } : {}),
    });
  }
  await tx.commit();

  const count = await client.fetch<number>('count(*[_type == "experience"])');
  console.log(`Seeded ${entries.length} entries; dataset now has ${count} experience documents.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
