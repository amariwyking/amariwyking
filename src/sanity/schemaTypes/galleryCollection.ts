import { defineField, defineType } from "sanity";

export const galleryCollection = defineType({
  name: "galleryCollection",
  title: "Gallery Collection",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (r) => r.required().max(255),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      validation: (r) => r.max(1000),
    }),
    defineField({
      name: "photos",
      type: "array",
      of: [{ type: "reference", to: [{ type: "galleryPhoto" }] }],
    }),
    defineField({
      name: "coverPhoto",
      type: "reference",
      to: [{ type: "galleryPhoto" }],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current", media: "coverPhoto.image" },
  },
});
