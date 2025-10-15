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

    // Try to get data from Supabase first
    try {
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

      // Add default date filter if no date filters provided
      if (!date && !startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        query = query.gte('tanggal', thirtyDaysAgo).lte('tanggal', today);
      }

      // Apply pagination
      const safeLimit = Math.min(limit, 1000);
      const safeOffset = Math.max(offset, 0);
      query = query.range(safeOffset, safeOffset + safeLimit - 1);

      const { data: attendance, error } = await query;

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }

      if (attendance) {
        console.log('✅ Successfully loaded attendance from Supabase:', attendance.length);
        
        return NextResponse.json({
          success: true,
          data: attendance,
          pagination: {
            total: attendance.length,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: attendance.length === safeLimit
          },
          source: 'supabase'
        });
      } else {
        console.log('⚠️ No attendance data found in Supabase');
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            limit: safeLimit,
            offset: safeOffset,
            hasMore: false
          },
          source: 'supabase',
          message: 'No attendance records found'
        });
      }
    } catch (supabaseError) {
      console.error('❌ Supabase connection failed:', supabaseError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: supabaseError.message,
        data: []
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Attendance list error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: []
      },
      { status: 500 }
    );
  }
}

