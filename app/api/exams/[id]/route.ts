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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: exam, error } = await supabaseAdmin
      .from('exams')
      .select(`
        id,
        title,
        description,
        subject,
        duration_minutes,
        total_questions,
        max_score,
        start_date,
        end_date,
        is_active,
        created_at,
        created_by
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
      title,
      description,
      subject,
      duration_minutes,
      total_questions,
      max_score,
      start_date,
      end_date,
      is_active
    } = await request.json();

    if (!title || !subject) {
      return NextResponse.json(
        { error: 'Title dan subject harus diisi' },
        { status: 400 }
      );
    }

    // Prepare update data for V3 schema
    const updateData: any = {
      title,
      subject,
      duration_minutes: duration_minutes || 60,
      total_questions: total_questions || 0,
      max_score: max_score || 100,
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString()
    };

    // Add optional fields
    if (description !== undefined) updateData.description = description;

    // Handle dates
    if (start_date) {
      updateData.start_date = new Date(start_date).toISOString();
    }

    if (end_date) {
      updateData.end_date = new Date(end_date).toISOString();
    }

    const { data: exam, error } = await supabaseAdmin
      .from('exams')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        id,
        title,
        description,
        subject,
        duration_minutes,
        total_questions,
        max_score,
        start_date,
        end_date,
        is_active,
        created_at,
        created_by
      `)
      .single();

    if (error) {
      console.error('Error updating exam:', error);
      return NextResponse.json(
        { error: 'Gagal memperbarui ujian', details: error.message },
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
      { error: 'Terjadi kesalahan server', details: error instanceof Error ? error.message : String(error) },
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
