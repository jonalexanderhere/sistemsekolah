import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Load environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const isActive = searchParams.get('is_active');
    const isPublished = searchParams.get('is_published');

    let query = supabaseAdmin
      .from('exams')
      .select(`
        id,
        judul,
        deskripsi,
        mata_pelajaran,
        kelas,
        tanggal_mulai,
        tanggal_selesai,
        durasi_menit,
        max_attempts,
        passing_score,
        is_active,
        is_published,
        created_at,
        users (
          nama
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (isPublished !== null) {
      query = query.eq('is_published', isPublished === 'true');
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: exams, error } = await query;

    if (error) {
      console.error('Error fetching exams:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data ujian' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('exams')
      .select('id', { count: 'exact', head: true });

    if (isActive !== null) countQuery = countQuery.eq('is_active', isActive === 'true');
    if (isPublished !== null) countQuery = countQuery.eq('is_published', isPublished === 'true');

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting exams:', countError);
    }

    return NextResponse.json({
      success: true,
      data: exams || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Exams list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
