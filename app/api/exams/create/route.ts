import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
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
      dibuat_oleh
    } = await request.json();

    if (!judul || !mata_pelajaran) {
      return NextResponse.json(
        { error: 'Judul dan mata pelajaran harus diisi' },
        { status: 400 }
      );
    }

    // Prepare exam data
    const examData: any = {
      judul,
      mata_pelajaran,
      durasi_menit: durasi_menit || 60,
      max_attempts: max_attempts || 1,
      passing_score: passing_score || 60.0,
      is_active: is_active !== undefined ? is_active : true,
      is_published: is_published !== undefined ? is_published : false
    };

    // Add optional fields
    if (deskripsi) examData.deskripsi = deskripsi;
    if (kelas) examData.kelas = kelas;
    if (dibuat_oleh) examData.dibuat_oleh = dibuat_oleh;

    // Handle dates
    if (tanggal_mulai) {
      examData.tanggal_mulai = new Date(tanggal_mulai).toISOString();
    } else {
      examData.tanggal_mulai = new Date().toISOString();
    }

    if (tanggal_selesai) {
      examData.tanggal_selesai = new Date(tanggal_selesai).toISOString();
    } else {
      // Default to 7 days from start date
      const endDate = new Date(examData.tanggal_mulai);
      endDate.setDate(endDate.getDate() + 7);
      examData.tanggal_selesai = endDate.toISOString();
    }

    const { data: exam, error } = await supabaseAdmin
      .from('exams')
      .insert(examData)
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
        created_at
      `)
      .single();

    if (error) {
      console.error('Error creating exam:', error);
      return NextResponse.json(
        { error: 'Gagal membuat ujian' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam
    });

  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
