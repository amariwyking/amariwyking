import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Public dataset: no token, safe to import from client components.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
