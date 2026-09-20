import { defineField, defineType } from "sanity";

export const galleryPhoto = defineType({
  name: "galleryPhoto",
  title: "Gallery Photo",
  type: "document",
  fields: [
    defineField({ name: "photoName", type: "string" }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true, metadata: ["exif", "lqip"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "alt", type: "string" }),
  ],
  preview: {
    select: { title: "photoName", media: "image" },
  },
});
