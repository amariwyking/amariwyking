import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "0jtrexcb",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
  typegen: {
    path: "./src/**/*.{ts,tsx}",
    schema: "./schema.json",
    generates: "./sanity.types.ts",
  },
});
