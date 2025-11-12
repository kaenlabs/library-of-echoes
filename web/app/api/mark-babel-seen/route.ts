import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Mark a Babel Moment as viewed for the current user
 * POST /api/mark-babel-seen
 * Body: { epochId: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { epochId } = body;

    if (!epochId) {
      return NextResponse.json(
        { error: 'epochId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      // Guest user - only use cookie/localStorage (already handled client-side)
      return NextResponse.json({ 
        success: true, 
        message: 'Guest view tracked via cookie' 
      });
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark epoch as seen in database
    await supabase.rpc('mark_babel_seen', {
      p_user_id: user.id,
      p_epoch_id: epochId,
    });

    console.log(`✅ User ${user.email} marked epoch ${epochId} as seen`);

    return NextResponse.json({ 
      success: true,
      message: `Epoch ${epochId} marked as seen for user ${user.id}` 
    });
  } catch (error) {
    console.error('Error marking Babel Moment as seen:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
