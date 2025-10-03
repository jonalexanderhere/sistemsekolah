import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Attendance API: Starting request');
    
    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📊 Attendance API: Parameters:', {
      date, userId, startDate, endDate, limit, offset
    });

    // Validate limit to prevent excessive queries
    const safeLimit = Math.min(limit, 1000);
    const safeOffset = Math.max(offset, 0);

    let query = supabaseAdmin
      .from('attendance')
      .select(`
        id,
        tanggal,
        waktu_masuk,
        waktu_keluar,
        status,
        method,
        notes,
        created_at,
        user_id,
        users!inner (
          id,
          nama,
          role,
          nisn
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters with proper date handling
    if (date) {
      console.log('📊 Applying date filter:', date);
      query = query.eq('tanggal', date);
    }

    if (userId) {
      console.log('📊 Applying user filter:', userId);
      query = query.eq('user_id', userId);
    }

    if (startDate && endDate) {
      console.log('📊 Applying date range filter:', { startDate, endDate });
      query = query.gte('tanggal', startDate).lte('tanggal', endDate);
    } else if (startDate) {
      console.log('📊 Applying start date filter:', startDate);
      query = query.gte('tanggal', startDate);
    } else if (endDate) {
      console.log('📊 Applying end date filter:', endDate);
      query = query.lte('tanggal', endDate);
    }

    // Add default date filter if no date filters provided
    if (!date && !startDate && !endDate) {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      console.log('📊 Applying default date range:', { thirtyDaysAgo, today });
      query = query.gte('tanggal', thirtyDaysAgo).lte('tanggal', today);
    }

    // Apply pagination
    query = query.range(safeOffset, safeOffset + safeLimit - 1);

    console.log('📊 Executing attendance query...');
    const { data: attendance, error } = await query;

    if (error) {
      console.error('❌ Error fetching attendance:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Gagal mengambil data absensi',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('📊 Attendance query successful, found', attendance?.length || 0, 'records');

    // Get total count for pagination
    console.log('📊 Getting total count...');
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
      console.error('❌ Error counting attendance:', countError);
      // Don't fail the request if count fails, just log it
    }

    console.log('📊 Total count:', count || 0);

    const response = {
      success: true,
      data: attendance || [],
      pagination: {
        total: count || 0,
        limit: safeLimit,
        offset: safeOffset,
        hasMore: (count || 0) > safeOffset + safeLimit
      }
    };

    console.log('📊 Attendance API: Response prepared successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Attendance list error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

