import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, status = 'hadir', meta = {} } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID harus diisi' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, nama, role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toISOString();

    // Check if already marked attendance today
    const { data: existingAttendance, error: checkError } = await supabaseAdmin
      .from('attendance')
      .select('id, status, waktu')
      .eq('user_id', userId)
      .eq('tanggal', today)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking attendance:', checkError);
      return NextResponse.json(
        { error: 'Gagal memeriksa data absensi' },
        { status: 500 }
      );
    }

    if (existingAttendance) {
      return NextResponse.json({
        success: false,
        message: 'Absensi hari ini sudah tercatat',
        attendance: {
          id: existingAttendance.id,
          status: existingAttendance.status,
          waktu: existingAttendance.waktu
        }
      });
    }

    // Get active attendance settings
    const { data: settings } = await supabaseAdmin
      .from('attendance_settings')
      .select('jam_masuk, jam_terlambat, jam_pulang, toleransi_menit')
      .eq('is_active', true)
      .single();

    // Use default times if no settings found
    const jamTerlambat = settings?.jam_terlambat || '07:30:00';
    const toleransiMenit = settings?.toleransi_menit || 5;

    // Determine status based on time (if not explicitly provided)
    let finalStatus = status;
    if (status === 'hadir') {
      const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
      
      // Compare with late time threshold
      if (currentTime > jamTerlambat) {
        finalStatus = 'terlambat';
      }
    }

    // Insert attendance record
    const { data: attendance, error: insertError } = await supabaseAdmin
      .from('attendance')
      .insert({
        user_id: userId,
        tanggal: today,
        waktu: currentTime,
        status: finalStatus,
        meta: {
          ...meta,
          method: 'face_recognition',
          timestamp: currentTime
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting attendance:', insertError);
      return NextResponse.json(
        { error: 'Gagal menyimpan data absensi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Absensi berhasil dicatat sebagai ${finalStatus}`,
      attendance: {
        id: attendance.id,
        status: attendance.status,
        waktu: attendance.waktu,
        user: {
          nama: user.nama,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Attendance marking error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
