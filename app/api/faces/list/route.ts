import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');

    let query = supabaseAdmin
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

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: faces, error } = await query;

    if (error) {
      console.error('Error fetching faces:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data wajah' },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedFaces = faces?.map((face: any) => ({
      id: face.user_id,
      descriptor: face.embedding,
      label: face.users?.nama || 'Unknown User',
      role: face.users?.role,
      nisn: face.users?.nisn,
      registeredAt: face.created_at,
      confidence: face.confidence,
      isPrimary: face.is_primary
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedFaces,
      pagination: {
        total: transformedFaces.length,
        limit,
        offset,
        hasMore: transformedFaces.length === limit
      }
    });

  } catch (error) {
    console.error('Faces list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
