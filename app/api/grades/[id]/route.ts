import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { assignment_name, subject, grade, max_grade, date, notes } = body;

    if (!assignment_name || !subject || !grade) {
      return NextResponse.json(
        { error: 'Data wajib diisi' },
        { status: 400 }
      );
    }

    const { data: gradeData, error } = await supabaseAdmin
      .from('grades')
      .update({
        assignment_name,
        subject,
        grade: parseFloat(grade),
        max_grade: parseFloat(max_grade) || 100,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || null
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating grade:', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui nilai' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gradeData,
      message: 'Nilai berhasil diperbarui'
    });

  } catch (error) {
    console.error('Grade update error:', error);
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
    const { error } = await supabaseAdmin
      .from('grades')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting grade:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus nilai' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Nilai berhasil dihapus'
    });

  } catch (error) {
    console.error('Grade deletion error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
