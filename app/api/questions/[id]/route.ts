import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: question, error } = await supabaseAdmin
      .from('questions')
      .select(`
        id,
        exam_id,
        question_text,
        question_type,
        options,
        points,
        order_index,
        time_limit_seconds,
        correct_answer,
        explanation,
        is_active,
        created_at,
        updated_at,
        exams (
          judul,
          mata_pelajaran
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return NextResponse.json(
        { error: 'Soal tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error('Question fetch error:', error);
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
    const body = await request.json();
    const {
      question_text,
      question_type,
      options,
      points,
      order_index,
      time_limit_seconds,
      correct_answer,
      explanation,
      is_active
    } = body;

    if (!question_text || !question_type || !points) {
      return NextResponse.json(
        { error: 'Data wajib diisi' },
        { status: 400 }
      );
    }

    const { data: questionData, error } = await supabaseAdmin
      .from('questions')
      .update({
        question_text,
        question_type,
        options: options || null,
        points: parseFloat(points),
        order_index: order_index || 0,
        time_limit_seconds: time_limit_seconds || null,
        correct_answer: correct_answer || null,
        explanation: explanation || null,
        is_active: is_active !== undefined ? is_active : true
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui soal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questionData,
      message: 'Soal berhasil diperbarui'
    });

  } catch (error) {
    console.error('Question update error:', error);
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
      .from('questions')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting question:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus soal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Soal berhasil dihapus'
    });

  } catch (error) {
    console.error('Question deletion error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
