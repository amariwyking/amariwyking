import { NextResponse } from "next/server";
import { requireAdminAuth, AuthenticationError } from "@/utils/auth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await requireAdminAuth();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Collection ID is required" },
      { status: 400 }
    );
  }

  try {
    const { name, description, cover_photo_id } = await request.json();

    // Validate fields if provided
    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Collection name must be a non-empty string" },
          { status: 400 }
        );
      }
      if (name.trim().length > 255) {
        return NextResponse.json(
          { error: "Collection name must be 255 characters or less" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (cover_photo_id !== undefined) {
      updateData.cover_photo_id = cover_photo_id || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // If updating name, check for uniqueness
    if (updateData.name) {
      const { data: existingCollection } = await supabase
        .from("gallery_collection")
        .select("id")
        .eq("name", updateData.name)
        .neq("id", id)
        .single();

      if (existingCollection) {
        return NextResponse.json(
          { error: "A collection with this name already exists" },
          { status: 409 }
        );
      }
    }

    const { data: updatedCollection, error } = await supabase
      .from("gallery_collection")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating collection:", error);
      return NextResponse.json(
        { error: "Failed to update collection" },
        { status: 500 }
      );
    }

    if (!updatedCollection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Collection updated successfully",
      collection: updatedCollection,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await requireAdminAuth();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Collection ID is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createAdminClient();

    // Check if collection exists and get photo count
    const { data: collection, error: fetchError } = await supabase
      .from("gallery_collection")
      .select(
        `
                id,
                name,
                gallery_photo_collection_link(count)
            `
      )
      .eq("id", id)
      .single();

    if (fetchError || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Delete the collection (CASCADE will handle photo links)
    const { error: deleteError } = await supabase
      .from("gallery_collection")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting collection:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete collection" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Collection ID is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createAdminClient();

    const { data: collection, error } = await supabase
      .from("gallery_collection")
      .select(
        `
                *,
                cover_photo:gallery_photo!cover_photo_id(
                    id,
                    filename,
                    blob_url
                )
            `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Collection not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching collection:", error);
      return NextResponse.json(
        { error: "Failed to fetch collection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
