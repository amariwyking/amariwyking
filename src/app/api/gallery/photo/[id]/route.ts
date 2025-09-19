import { NextResponse } from "next/server";
import { requireAdminAuth, AuthenticationError } from "@/utils/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { del } from "@vercel/blob";

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
      { error: "Photo ID is required" },
      { status: 400 }
    );
  }

  try {
    const updateData = await request.json();

    // Validate allowed fields for update
    const allowedFields = ["f_stop", "iso", "shutter_speed"];
    const filteredData: Record<string, any> = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = value;
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const { data: updatedPhoto, error } = await supabase
      .from("gallery_photo")
      .update(filteredData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating photo:", error);
      return NextResponse.json(
        { error: "Failed to update photo" },
        { status: 500 }
      );
    }

    if (!updatedPhoto) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Photo updated successfully",
      photo: updatedPhoto,
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
      { error: "Photo ID is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createAdminClient();

    // First, get the photo to retrieve the blob URL for deletion
    const { data: photo, error: fetchError } = await supabase
      .from("gallery_photo")
      .select("blob_url")
      .eq("id", id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete from database (CASCADE will handle collection links)
    const { error: deleteError } = await supabase
      .from("gallery_photo")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting photo from database:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete photo" },
        { status: 500 }
      );
    }

    // Delete from Vercel Blob storage
    try {
      await del(photo.blob_url);
      console.log("Successfully deleted photo from Vercel Blob storage");
    } catch (blobError) {
      console.error(
        "Failed to delete photo from Vercel Blob storage:",
        blobError
      );
      // Don't fail the entire operation if blob deletion fails
      // The database record is already deleted
    }

    return NextResponse.json({
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
