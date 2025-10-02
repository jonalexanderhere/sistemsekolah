import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('attendance')
      .select(`
        id,
        tanggal,
        waktu,
        status,
        meta,
        users (
          id,
          nama,
          role,
          nisn
        )
      `)
      .order('waktu', { ascending: false });

    // Apply filters
    if (date) {
      query = query.eq('tanggal', date);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate && endDate) {
      query = query.gte('tanggal', startDate).lte('tanggal', endDate);
    } else if (startDate) {
      query = query.gte('tanggal', startDate);
    } else if (endDate) {
      query = query.lte('tanggal', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: attendance, error } = await query;

    if (error) {
      console.error('Error fetching attendance:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data absensi' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('attendance')
      .select('id', { count: 'exact', head: true });

    if (date) countQuery = countQuery.eq('tanggal', date);
    if (userId) countQuery = countQuery.eq('user_id', userId);
    if (startDate && endDate) {
      countQuery = countQuery.gte('tanggal', startDate).lte('tanggal', endDate);
    } else if (startDate) {
      countQuery = countQuery.gte('tanggal', startDate);
    } else if (endDate) {
      countQuery = countQuery.lte('tanggal', endDate);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting attendance:', countError);
    }

    return NextResponse.json({
      success: true,
      data: attendance || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Attendance list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

