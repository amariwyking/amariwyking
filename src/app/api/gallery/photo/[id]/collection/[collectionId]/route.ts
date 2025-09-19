import { NextResponse } from "next/server";
import { requireAdminAuth, AuthenticationError } from "@/utils/auth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; collectionId: string }> }
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

  const { id: photoId, collectionId } = await params;

  if (!photoId || !collectionId) {
    return NextResponse.json(
      { error: "Photo ID and Collection ID are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createAdminClient();

    // First check if the link exists
    const { data: existingLink, error: checkError } = await supabase
      .from("gallery_photo_collection_link")
      .select("*")
      .eq("photo_id", photoId)
      .eq("collection_id", collectionId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking photo-collection link:", checkError);
      return NextResponse.json(
        { error: "Failed to check photo-collection link" },
        { status: 500 }
      );
    }

    if (!existingLink) {
      return NextResponse.json(
        { error: "Photo is not in this collection" },
        { status: 404 }
      );
    }

    // Remove the photo-collection link
    const { error: deleteError } = await supabase
      .from("gallery_photo_collection_link")
      .delete()
      .eq("photo_id", photoId)
      .eq("collection_id", collectionId);

    if (deleteError) {
      console.error("Error removing photo from collection:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove photo from collection" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Photo removed from collection successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}