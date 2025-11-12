import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getRemainingMessagesDB } from '@/lib/rateLimitDB';
import { getClientIp, hashIp } from '@/lib/ipUtils';

export async function GET(request: NextRequest) {
  try {
    // Get client IP
    const clientIp = getClientIp(request);
    const ipHash = hashIp(clientIp);
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Check if user is authenticated
    let user = null;
    if (token) {
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }
    
    const isAuthenticated = !!user;
    const identifier = isAuthenticated ? user!.id : ipHash;
    
    // Get remaining messages (Database-backed)
    const remaining = await getRemainingMessagesDB(identifier, isAuthenticated);
    
    return NextResponse.json({
      remainingMessages: remaining,
      isAuthenticated,
      limit: isAuthenticated ? 5 : 1,
    });
    
  } catch (error) {
    console.error('Error getting remaining messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
