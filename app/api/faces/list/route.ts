import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Load environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDU1NjAsImV4cCI6MjA3NDk4MTU2MH0.UQ49a5K0Me7-aS5U80bRBLExnx-Hmgpg4X4DMXgZP5Y';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const supabaseFallback = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Faces list API: Starting request');
    
    // Try to get data from Supabase first
    try {
      const { data: faces, error } = await supabaseAdmin
        .from('faces')
        .select(`
          id,
          user_id,
          embedding,
          confidence,
          is_primary,
          is_active,
          created_at,
          users!inner (
            id,
            nama,
            role,
            nisn,
            class_name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && faces) {
        console.log('✅ Successfully loaded faces from Supabase:', faces.length);
        
        // Transform data for frontend
        const transformedFaces = faces.map((face: any) => ({
          id: face.user_id,
          descriptor: face.embedding,
          label: face.users?.nama || 'Unknown User',
          role: face.users?.role,
          nisn: face.users?.nisn,
          registeredAt: face.created_at,
          confidence: face.confidence,
          isPrimary: face.is_primary
        }));

        return NextResponse.json({
          success: true,
          data: transformedFaces,
          source: 'supabase'
        });
      }
    } catch (supabaseError) {
      console.warn('Supabase failed, falling back to localStorage:', supabaseError);
    }

    // Fallback to localStorage
    console.log('📱 Loading faces from localStorage fallback');
    
    // Get faces from localStorage (this is a fallback)
    const storedFaces = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('registeredFaces') || '[]')
      : [];

    console.log('📱 Loaded faces from localStorage:', storedFaces.length);

    return NextResponse.json({
      success: true,
      data: storedFaces,
      source: 'localStorage',
      message: 'Using localStorage fallback - Supabase connection failed'
    });

  } catch (error) {
    console.error('❌ Faces list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan server',
        details: error instanceof Error ? error.message : String(error),
        data: []
      },
      { status: 500 }
    );
  }
}
