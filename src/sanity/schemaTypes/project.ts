import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required().min(3).max(255),
    }),
    defineField({
      name: "description",
      type: "text",
      validation: (r) => r.required().min(20),
    }),
    defineField({
      name: "skills",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.unique(),
    }),
    defineField({
      name: "images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true, metadata: ["lqip"] },
          fields: [
            {
              name: "caption",
              type: "string",
              validation: (r) => r.max(255),
            },
            { name: "alt", type: "string" },
          ],
        },
      ],
    }),
    defineField({ name: "projectEndDate", type: "date" }),
    defineField({ name: "projectLink", type: "url" }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", subtitle: "projectEndDate", media: "images.0" },
  },
});
