import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: exam, error } = await supabaseAdmin
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
      .eq('id', params.id)
      .single();

    if (error || !exam) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam
    });

  } catch (error) {
    console.error('Get exam error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      is_published
    } = await request.json();

    if (!judul || !mata_pelajaran) {
      return NextResponse.json(
        { error: 'Judul dan mata pelajaran harus diisi' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      judul,
      mata_pelajaran,
      durasi_menit: durasi_menit || 60,
      max_attempts: max_attempts || 1,
      passing_score: passing_score || 60.0,
      is_active: is_active !== undefined ? is_active : true,
      is_published: is_published !== undefined ? is_published : false,
      updated_at: new Date().toISOString()
    };

    // Add optional fields
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (kelas !== undefined) updateData.kelas = kelas;

    // Handle dates
    if (tanggal_mulai) {
      updateData.tanggal_mulai = new Date(tanggal_mulai).toISOString();
    }

    if (tanggal_selesai) {
      updateData.tanggal_selesai = new Date(tanggal_selesai).toISOString();
    }

    const { data: exam, error } = await supabaseAdmin
      .from('exams')
      .update(updateData)
      .eq('id', params.id)
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
      console.error('Error updating exam:', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui ujian' },
        { status: 500 }
      );
    }

    if (!exam) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam
    });

  } catch (error) {
    console.error('Update exam error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if exam has questions or results
    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('id')
      .eq('exam_id', params.id)
      .limit(1);

    const { data: results } = await supabaseAdmin
      .from('exam_results')
      .select('id')
      .eq('exam_id', params.id)
      .limit(1);

    if (questions && questions.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus ujian yang sudah memiliki soal. Hapus soal terlebih dahulu.' },
        { status: 400 }
      );
    }

    if (results && results.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus ujian yang sudah memiliki hasil. Data hasil akan hilang.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('exams')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting exam:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus ujian' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ujian berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete exam error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
