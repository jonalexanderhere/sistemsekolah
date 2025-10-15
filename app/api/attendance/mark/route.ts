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

export async function POST(request: NextRequest) {
  try {
    const { user_id, status = 'hadir', method = 'qr_code', meta = {} } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID harus diisi' },
        { status: 400 }
      );
    }

    console.log('📝 Attendance mark API: Processing request for user:', user_id);

    // Try to save to Supabase first
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toISOString();

      // Check for existing attendance today (1x per day limit)
      const { data: existingAttendance } = await supabaseAdmin
        .from('attendance')
        .select('id, status, waktu_masuk')
        .eq('user_id', user_id)
        .eq('tanggal', today)
        .single();

      if (existingAttendance) {
        return NextResponse.json({
          success: false,
          message: 'Absensi hari ini sudah tercatat',
          attendance: {
            id: existingAttendance.id,
            status: existingAttendance.status,
            waktu_masuk: existingAttendance.waktu_masuk
          }
        });
      }

      // Determine status based on time
      let finalStatus = status;
      if (status === 'hadir') {
        const currentTimeStr = now.toTimeString().split(' ')[0];
        if (currentTimeStr > '07:30:00') {
          finalStatus = 'terlambat';
        }
      }

      // Insert attendance record
      const { data: attendance, error: insertError } = await supabaseAdmin
        .from('attendance')
        .insert({
          user_id: user_id,
          tanggal: today,
          waktu_masuk: currentTime,
          status: finalStatus,
          method: method,
          confidence_score: meta.confidence || null,
          notes: meta.notes || null
        })
        .select()
        .single();

      if (!insertError && attendance) {
        console.log('✅ Successfully saved attendance to Supabase');
        
        return NextResponse.json({
          success: true,
          message: `Absensi berhasil dicatat sebagai ${finalStatus}`,
          data: {
            id: attendance.id,
            status: attendance.status,
            waktu_masuk: attendance.waktu_masuk,
            user_id: user_id
          }
        });
      }
    } catch (supabaseError) {
      console.error('❌ Supabase connection failed:', supabaseError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Attendance marking error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
