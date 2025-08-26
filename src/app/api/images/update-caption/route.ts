import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdminAuth, AuthenticationError } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user first
    await requireAdminAuth();

    const { imageId, caption } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const { error } = await supabase
      .from('project_image')
      .update({ caption })
      .eq('id', imageId);

    if (error) {
      console.error('Error updating image caption:', error);
      return NextResponse.json(
        { error: 'Failed to update image caption' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update-caption route:', error);
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}