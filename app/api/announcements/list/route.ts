import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: announcements, error } = await supabaseAdmin
      .from('pengumuman')
      .select(`
        id,
        judul,
        isi,
        tanggal,
        created_at,
        users (
          nama
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data pengumuman' },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('pengumuman')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting announcements:', countError);
    }

    return NextResponse.json({
      success: true,
      data: announcements || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Announcements list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { judul, isi, dibuat_oleh, tanggal } = await request.json();

    if (!judul || !isi || !dibuat_oleh) {
      return NextResponse.json(
        { error: 'Judul, isi, dan pembuat harus diisi' },
        { status: 400 }
      );
    }

    const { data: announcement, error } = await supabaseAdmin
      .from('pengumuman')
      .insert({
        judul,
        isi,
        dibuat_oleh,
        tanggal: tanggal || new Date().toISOString().split('T')[0]
      })
      .select(`
        id,
        judul,
        isi,
        tanggal,
        created_at,
        users (
          nama
        )
      `)
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json(
        { error: 'Gagal membuat pengumuman' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: announcement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

