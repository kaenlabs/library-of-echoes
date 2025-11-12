import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Check if there's a completed epoch that user hasn't seen
 * Returns epoch ID if there is one, null otherwise
 * 
 * For authenticated users: Check database
 * For guests: Check cookie/localStorage
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get the most recently completed epoch
    const { data: completedEpoch } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', false)
      .order('closed_at', { ascending: false })
      .limit(1)
      .single();

    if (!completedEpoch) {
      return NextResponse.json({ hasUnseen: false });
    }

    // Check if user is authenticated
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    let user = null;
    if (token) {
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    if (user) {
      // AUTHENTICATED USER: Check database
      const { data: hasViewed } = await supabase
        .rpc('has_seen_babel', { 
          p_user_id: user.id, 
          p_epoch_id: completedEpoch.id 
        });

      if (hasViewed) {
        // User already saw this epoch
        return NextResponse.json({ hasUnseen: false });
      }

      // User hasn't seen this epoch - show it ONCE
      return NextResponse.json({
        hasUnseen: true,
        epochId: completedEpoch.id,
        epochName: completedEpoch.name,
        isAuthenticated: true,
      });
    } else {
      // GUEST USER: Always show (no tracking)
      // Misafirler her zaman görebilir
      return NextResponse.json({
        hasUnseen: true,
        epochId: completedEpoch.id,
        epochName: completedEpoch.name,
        isAuthenticated: false,
      });
    }
  } catch (error) {
    console.error('Error checking unseen Babel Moment:', error);
    return NextResponse.json({ hasUnseen: false });
  }
}
