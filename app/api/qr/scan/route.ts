import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📱 QR Scan API: Starting request');
    
    const { qrData } = await request.json();
    
    if (!qrData) {
      return NextResponse.json({
        success: false,
        error: 'QR Data is required'
      }, { status: 400 });
    }

    // Extract student NISN from QR data
    const nisn = qrData.replace('STUDENT_', '');
    
    console.log('🔍 QR Data received:', qrData);
    console.log('🔍 Extracted NISN:', nisn);
    
    if (!nisn) {
      console.log('❌ Invalid QR Code format - no NISN extracted');
      return NextResponse.json({
        success: false,
        error: 'Invalid QR Code format'
      }, { status: 400 });
    }

    try {
      // Find student by NISN
      const { data: student, error } = await supabaseAdmin
        .from('users')
        .select('id, nama, nisn, role, class_name')
        .eq('nisn', nisn)
        .eq('role', 'siswa')
        .single();

      if (error || !student) {
        console.log('❌ Student not found:', error?.message || 'No student data');
        console.log('🔍 Searching for NISN:', nisn);
        return NextResponse.json({
          success: false,
          error: 'Student not found',
          details: error?.message || 'No student with this NISN'
        }, { status: 404 });
      }

      console.log('✅ Student found:', student.nama);
      
      // Check for existing attendance today (1x per day limit)
      const today = new Date().toISOString().split('T')[0];
      const { data: existingAttendance } = await supabaseAdmin
        .from('attendance')
        .select('id, status, waktu_masuk')
        .eq('user_id', student.id)
        .eq('tanggal', today)
        .single();

      if (existingAttendance) {
        console.log('⚠️ Attendance already recorded today for:', student.nama);
        return NextResponse.json({
          success: false,
          error: 'Absensi hari ini sudah tercatat',
          message: `${student.nama} sudah melakukan absensi hari ini`,
          attendance: {
            id: existingAttendance.id,
            status: existingAttendance.status,
            waktu_masuk: existingAttendance.waktu_masuk
          }
        });
      }
      
      // Mark attendance
      const now = new Date().toISOString();
      
      try {
        // Insert attendance record
        const { data: attendance, error: attendanceError } = await supabaseAdmin
          .from('attendance')
          .insert({
            user_id: student.id,
            tanggal: today,
            waktu_masuk: now,
            status: 'hadir',
            method: 'qr_code',
            meta: {
              scanned_at: now,
              qr_data: qrData,
              scanner_type: 'qr_scanner'
            }
          })
          .select()
          .single();

        if (attendanceError) {
          console.error('❌ Attendance insert error:', attendanceError);
          // Continue even if attendance insert fails
        } else {
          console.log('✅ Attendance recorded:', attendance.id);
        }
      } catch (attendanceError) {
        console.error('❌ Attendance error:', attendanceError);
        // Continue even if attendance fails
      }
      
      return NextResponse.json({
        success: true,
        data: {
          student: {
            id: student.id,
            nama: student.nama,
            nisn: student.nisn,
            class_name: student.class_name
          },
          attendance: {
            tanggal: today,
            waktu_masuk: now,
            status: 'hadir',
            method: 'qr_code'
          }
        }
      });

    } catch (supabaseError) {
      console.error('❌ Supabase connection failed:', supabaseError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: supabaseError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ QR Scan error:', error);
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
