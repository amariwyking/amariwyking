"use server";

import { revalidatePath } from "next/cache";
import { TablesInsert } from "@/app/types/database";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdminAuth, AuthenticationError } from "@/utils/auth";

interface ProjectImageData {
  id: string;
  caption: string | null;
  blobUrl: string;
}

interface ProjectData {
  title: string;
  description: string;
  project_end_date: string | null;
  skills: string[];
  imageData: ProjectImageData[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface CreateProjectResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
  project?: any;
}

const validateBlobUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("blob.vercel-storage.com");
  } catch {
    return false;
  }
};

const validateDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return (
    !isNaN(date.getTime()) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/) !== null
  );
};

export const createProject = async (
  projectData: ProjectData
): Promise<CreateProjectResponse> => {
  // Authenticate admin user first
  try {
    await requireAdminAuth();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
        errors: [{ field: "auth", message: error.message }],
      };
    }
    return {
      success: false,
      message: "Authentication error occurred",
      errors: [{ field: "auth", message: "Authentication failed" }],
    };
  }

  const supabase = await createAdminClient();
  const errors: ValidationError[] = [];

  // Enhanced server-side validation
  const title = projectData.title?.trim();
  if (!title) {
    errors.push({ field: "title", message: "Project title is required" });
  } else if (title.length < 3) {
    errors.push({
      field: "title",
      message: "Title must be at least 3 characters long",
    });
  } else if (title.length > 255) {
    errors.push({
      field: "title",
      message: "Title must be less than 255 characters",
    });
  }

  const description = projectData.description?.trim();
  if (!description) {
    errors.push({
      field: "description",
      message: "Project description is required",
    });
  } else if (description.length < 20) {
    errors.push({
      field: "description",
      message: "Description must be at least 20 characters long",
    });
  }

  // Validate date format if provided
  if (projectData.project_end_date) {
    if (!validateDate(projectData.project_end_date)) {
      errors.push({
        field: "project_end_date",
        message: "Invalid date format",
      });
    }
  }

  // Validate skills
  const validSkills: string[] = [];
  if (projectData.skills && projectData.skills.length > 0) {
    projectData.skills.forEach((skill) => {
      const trimmedSkill = skill.trim();
      if (trimmedSkill.length > 50) {
        errors.push({
          field: "skills",
          message: `Skill "${trimmedSkill}" must be 50 characters or less`,
        });
      } else if (trimmedSkill && !validSkills.includes(trimmedSkill)) {
        validSkills.push(trimmedSkill);
      }
    });
  }

  // Validate image data
  const validImageData: ProjectImageData[] = [];
  if (projectData.imageData && projectData.imageData.length > 0) {
    projectData.imageData.forEach((imageData, index) => {
      if (!imageData.id || typeof imageData.id !== "string") {
        errors.push({
          field: "images",
          message: `Invalid UUID at position ${index + 1}`,
        });
      } else if (!imageData.blobUrl || !validateBlobUrl(imageData.blobUrl)) {
        errors.push({
          field: "images",
          message: `Invalid blob URL at position ${index + 1}`,
        });
      } else if (imageData.caption && imageData.caption.length > 255) {
        errors.push({
          field: "images",
          message: `Caption at position ${index + 1} must be 255 characters or less`,
        });
      } else {
        validImageData.push(imageData);
      }
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }

  try {
    // Step 1: Create the main project record
    const newProject: TablesInsert<"project"> = {
      title,
      description,
      project_end_date: projectData.project_end_date || null,
      skills: validSkills.length > 0 ? validSkills : null,
      images: validImageData.map((image) => image.id),
    };

    const { data: insertedProject, error: projectError } = await supabase
      .from("project")
      .insert([newProject])
      .select();

    if (projectError) {
      console.error("Error inserting project:", projectError);
      return {
        success: false,
        message: `Failed to create project: ${projectError.message}`,
      };
    }

    const projectId = insertedProject[0].id;
    console.log("Created project with ID:", projectId);

    // Step 2: Create linking records in project_image_link table first
    const imageIds: string[] = [];
    if (validImageData.length > 0) {
      // Extract the UUIDs from the image data
      imageIds.push(...validImageData.map((image) => image.id));

      const imageLinkRecords: TablesInsert<"project_image_link">[] =
        imageIds.map((imageId) => ({
          project_id: projectId,
          image_id: imageId,
        }));

      const { error: linkError } = await supabase
        .from("project_image_link")
        .insert(imageLinkRecords);

      if (linkError) {
        console.error("Error inserting project image links:", linkError);
        // Rollback: Delete the project since linking failed
        await supabase.from("project").delete().eq("id", projectId);
        return {
          success: false,
          message: `Failed to create project image links: ${linkError.message}`,
        };
      }

      console.log("Created project image links:", imageLinkRecords.length);

      // Step 3: Create image records in project_image table (now that links exist)
      const imageRecords: TablesInsert<"project_image">[] = validImageData.map(
        (image) => ({
          id: image.id,
          caption: image.caption,
          blob_url: image.blobUrl,
        })
      );

      const { data: insertedImages, error: imageError } = await supabase
        .from("project_image")
        .insert(imageRecords)
        .select("id");

      if (imageError) {
        console.error("Error inserting project images:", imageError);
        // Rollback: Delete the project and links since image creation failed
        await supabase
          .from("project_image_link")
          .delete()
          .eq("project_id", projectId);
        await supabase.from("project").delete().eq("id", projectId);
        return {
          success: false,
          message: `Failed to create project images: ${imageError.message}`,
        };
      }

      console.log("Created project images:", insertedImages.length);
    }

    // Handle skills - find existing skills or create new ones
    if (validSkills.length > 0) {
      const skillIds: string[] = [];

      for (const skillName of validSkills) {
        // Check if skill exists
        const { data: existingSkill } = await supabase
          .from("skill")
          .select("id")
          .eq("name", skillName)
          .single();

        if (existingSkill) {
          skillIds.push(existingSkill.id);
        } else {
          // Create new skill
          const { data: newSkill, error: skillError } = await supabase
            .from("skill")
            .insert({ name: skillName })
            .select("id")
            .single();

          if (skillError) {
            console.error("Error creating skill:", skillError);
            // Continue with other skills, but log the error
          } else if (newSkill) {
            skillIds.push(newSkill.id);
          }
        }
      }

      // Create skill links
      if (skillIds.length > 0) {
        const skillLinks: TablesInsert<"project_skill_link">[] = skillIds.map(
          (skillId) => ({
            project_id: projectId,
            skill_id: skillId,
          })
        );

        const { error: skillLinkError } = await supabase
          .from("project_skill_link")
          .insert(skillLinks);

        if (skillLinkError) {
          console.error("Error inserting project skill links:", skillLinkError);
          // Don't rollback the entire project for skill link failures
        } else {
          console.log("Created project skill links:", skillLinks.length);
        }
      }
    }

    // Revalidate the path where projects are displayed
    revalidatePath("/projects");
    revalidatePath("/");

    return {
      success: true,
      message: "Project created successfully!",
      project: insertedProject[0],
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while creating the project",
    };
  }
};
