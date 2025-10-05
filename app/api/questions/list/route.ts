import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const examId = searchParams.get('examId');
    const questionType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
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
        exams (
          judul,
          mata_pelajaran
        )
      `)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (examId) {
      query = query.eq('exam_id', examId);
    }

    if (questionType) {
      query = query.eq('question_type', questionType);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: questions, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data soal' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('questions')
      .select('id', { count: 'exact', head: true });

    if (examId) countQuery = countQuery.eq('exam_id', examId);
    if (questionType) countQuery = countQuery.eq('question_type', questionType);

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting questions:', countError);
    }

    return NextResponse.json({
      success: true,
      data: questions || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Questions list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      exam_id,
      question_text,
      question_type,
      options,
      points,
      order_index,
      time_limit_seconds,
      correct_answer,
      explanation
    } = body;

    if (!exam_id || !question_text || !question_type || !points) {
      return NextResponse.json(
        { error: 'Data wajib diisi' },
        { status: 400 }
      );
    }

    const { data: questionData, error } = await supabaseAdmin
      .from('questions')
      .insert({
        exam_id,
        question_text,
        question_type,
        options: options || null,
        points: parseFloat(points),
        order_index: order_index || 0,
        time_limit_seconds: time_limit_seconds || null,
        correct_answer: correct_answer || null,
        explanation: explanation || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan soal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questionData,
      message: 'Soal berhasil disimpan'
    });

  } catch (error) {
    console.error('Question creation error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
