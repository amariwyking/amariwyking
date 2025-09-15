import { NextResponse } from "next/server";
import { requireAdminAuth, AuthenticationError } from "@/utils/auth";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request): Promise<NextResponse> {
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

  try {
    const { name, description, cover_photo_id } = await request.json();

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: "Collection name must be 255 characters or less" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Check if collection name already exists
    const { data: existingCollection } = await supabase
      .from("gallery_collection")
      .select("id")
      .eq("name", name.trim())
      .single();

    if (existingCollection) {
      return NextResponse.json(
        { error: "A collection with this name already exists" },
        { status: 409 }
      );
    }

    // Create the collection
    const collectionData = {
      name: name.trim(),
      description: description?.trim() || null,
      cover_photo_id: cover_photo_id || null,
    };

    const { data: newCollection, error } = await supabase
      .from("gallery_collection")
      .insert([collectionData])
      .select()
      .single();

    if (error) {
      console.error("Error creating collection:", error);
      return NextResponse.json(
        { error: "Failed to create collection" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Collection created successfully",
        collection: newCollection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request): Promise<NextResponse> {
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

  const { searchParams } = new URL(request.url);
  const includePhotoCounts =
    searchParams.get("include_photo_counts") === "true";

  try {
    const supabase = await createAdminClient();

    let query = supabase
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
      .order("created_at", { ascending: false });

    const { data: collections, error } = await query;

    if (error) {
      console.error("Error fetching collections:", error);
      return NextResponse.json(
        { error: "Failed to fetch collections" },
        { status: 500 }
      );
    }

    // If photo counts are requested, fetch them separately
    if (includePhotoCounts && collections) {
      const collectionsWithCounts = await Promise.all(
        collections.map(async (collection) => {
          const { count } = await supabase
            .from("gallery_photo_collection_link")
            .select("*", { count: "exact", head: true })
            .eq("collection_id", collection.id);

          return {
            ...collection,
            photo_count: count || 0,
          };
        })
      );

      return NextResponse.json({ collections: collectionsWithCounts });
    }

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
