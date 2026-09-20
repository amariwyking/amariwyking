import { defineField, defineType } from "sanity";

export const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({
      name: "employer",
      type: "string",
      validation: (r) => r.required().max(255),
    }),
    defineField({
      name: "role",
      type: "string",
      validation: (r) => r.required().max(255),
    }),
    defineField({
      name: "startDate",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "endDate",
      type: "date",
      description: "Leave empty for a current position.",
    }),
    defineField({
      name: "type",
      type: "string",
      options: {
        list: [
          { title: "Work", value: "work" },
          { title: "Project", value: "project" },
          { title: "Education", value: "education" },
        ],
        layout: "radio",
      },
      initialValue: "work",
    }),
    defineField({
      name: "notes",
      type: "array",
      of: [{ type: "text", rows: 3 }],
      description: "Bullet points shown under the role.",
    }),
    defineField({
      name: "skills",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.unique(),
    }),
    defineField({
      name: "question",
      type: "string",
      description: "Stored for later use; not rendered yet.",
    }),
  ],
  preview: {
    select: { title: "employer", subtitle: "role" },
  },
  orderings: [
    {
      title: "Start date, newest first",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
  ],
});
