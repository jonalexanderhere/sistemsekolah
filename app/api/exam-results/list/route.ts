import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const examId = searchParams.get('examId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('exam_results')
      .select(`
        id,
        exam_id,
        user_id,
        total_questions,
        correct_answers,
        total_points,
        max_points,
        percentage,
        grade,
        letter_grade,
        is_passed,
        time_started,
        time_finished,
        duration_minutes,
        attempt_number,
        status,
        created_at,
        users (
          nama,
          nisn,
          class_name
        ),
        exams (
          judul,
          mata_pelajaran
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (examId) {
      query = query.eq('exam_id', examId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: results, error } = await query;

    if (error) {
      console.error('Error fetching exam results:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data hasil ujian' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('exam_results')
      .select('id', { count: 'exact', head: true });

    if (examId) countQuery = countQuery.eq('exam_id', examId);
    if (userId) countQuery = countQuery.eq('user_id', userId);

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting exam results:', countError);
    }

    return NextResponse.json({
      success: true,
      data: results || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Exam results list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
