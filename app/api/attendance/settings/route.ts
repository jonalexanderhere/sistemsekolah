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
    // Return default settings since attendance_settings table doesn't exist in V3
    const defaultSettings = {
      id: 'default',
      name: 'Default Schedule',
      jam_masuk: '07:00:00',
      jam_terlambat: '07:30:00',
      jam_pulang: '15:00:00',
      toleransi_menit: 5,
      is_active: true
    };

    return NextResponse.json({
      success: true,
      data: defaultSettings
    });

  } catch (error) {
    console.error('Attendance settings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      jam_masuk, 
      jam_terlambat, 
      jam_pulang, 
      toleransi_menit,
      created_by 
    } = await request.json();

    if (!name || !jam_masuk || !jam_terlambat || !jam_pulang) {
      return NextResponse.json(
        { error: 'Semua field waktu harus diisi' },
        { status: 400 }
      );
    }

    // Deactivate current active settings
    await supabaseAdmin
      .from('attendance_settings')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new settings
    const { data: newSettings, error } = await supabaseAdmin
      .from('attendance_settings')
      .insert({
        name,
        jam_masuk,
        jam_terlambat,
        jam_pulang,
        toleransi_menit: toleransi_menit || 5,
        is_active: true,
        created_by
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating attendance settings:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan pengaturan absensi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newSettings,
      message: 'Pengaturan absensi berhasil disimpan'
    });

  } catch (error) {
    console.error('Create attendance settings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { 
      id,
      name, 
      jam_masuk, 
      jam_terlambat, 
      jam_pulang, 
      toleransi_menit 
    } = await request.json();

    if (!id || !name || !jam_masuk || !jam_terlambat || !jam_pulang) {
      return NextResponse.json(
        { error: 'ID dan semua field waktu harus diisi' },
        { status: 400 }
      );
    }

    const { data: updatedSettings, error } = await supabaseAdmin
      .from('attendance_settings')
      .update({
        name,
        jam_masuk,
        jam_terlambat,
        jam_pulang,
        toleransi_menit: toleransi_menit || 5,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendance settings:', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui pengaturan absensi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Pengaturan absensi berhasil diperbarui'
    });

  } catch (error) {
    console.error('Update attendance settings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

