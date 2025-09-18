import { NextResponse } from "next/server";
import { requireAdminAuth, AuthenticationError } from "@/utils/auth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collection_id");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  console.log(searchParams);

  try {
    const supabase = await createAdminClient();

    let query;

    // Filter by collection if specified
    if (collectionId) {
      query = supabase
        .from("gallery_photo")
        .select(`*, gallery_photo_collection_link!inner(collection_id)`)
        .eq("gallery_photo_collection_link.collection_id", collectionId)
        .order("created_at", { ascending: false });
    } else {
      query = supabase
        .from("gallery_photo")
        .select("*")
        .order("created_at", { ascending: false });
    }

    // Add pagination if specified
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = offset ? parseInt(offset) : 0;
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }

    const { data: photos, error } = await query;

    if (error) {
      console.error("Error fetching gallery photos:", error);
      return NextResponse.json(
        { error: "Failed to fetch photos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
