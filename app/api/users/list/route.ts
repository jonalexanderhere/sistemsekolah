import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('users')
      .select('id, nama, role, nisn, identitas, created_at, face_embedding')
      .order('nama', { ascending: true });

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`nama.ilike.%${search}%,nisn.ilike.%${search}%,identitas.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data pengguna' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (role) countQuery = countQuery.eq('role', role);
    if (search) {
      countQuery = countQuery.or(`nama.ilike.%${search}%,nisn.ilike.%${search}%,identitas.ilike.%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting users:', countError);
    }

    // Transform data to include face registration status
    const transformedUsers = users?.map(user => ({
      id: user.id,
      nama: user.nama,
      role: user.role,
      nisn: user.nisn,
      identitas: user.identitas,
      created_at: user.created_at,
      has_face: !!user.face_embedding
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Users list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

