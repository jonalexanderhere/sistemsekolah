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

export async function POST(request: NextRequest) {
  try {
    const { exam_id, user_id, answers, time_taken_minutes } = await request.json();

    if (!exam_id || !user_id) {
      return NextResponse.json(
        { error: 'Exam ID dan User ID harus diisi' },
        { status: 400 }
      );
    }

    // Get exam questions to calculate score
    const { data: examQuestions, error: examError } = await supabaseAdmin
      .from('exam_questions')
      .select(`
        question_id,
        points,
        questions (
          id,
          correct_answer,
          points
        )
      `)
      .eq('exam_id', exam_id);

    if (examError) {
      console.error('Error fetching exam questions:', examError);
      return NextResponse.json(
        { error: 'Gagal mengambil data soal ujian' },
        { status: 500 }
      );
    }

    // Calculate score
    let totalScore = 0;
    let maxScore = 0;
    const correctAnswers = 0;
    const totalQuestions = examQuestions?.length || 0;

    examQuestions?.forEach((eq: any) => {
      const question = eq.questions;
      maxScore += (question as any)?.points || eq.points || 1;
      
      if (answers[(question as any)?.id] === (question as any)?.correct_answer) {
        totalScore += (question as any)?.points || eq.points || 1;
      }
    });

    // Save exam result
    const { data: result, error: resultError } = await supabaseAdmin
      .from('exam_results')
      .insert({
        exam_id,
        user_id,
        score: totalScore,
        max_score: maxScore,
        answers: answers,
        time_taken_minutes: time_taken_minutes || 0,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (resultError) {
      console.error('Error saving exam result:', resultError);
      return NextResponse.json(
        { error: 'Gagal menyimpan hasil ujian' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        score: totalScore,
        max_score: maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        correct_answers: Object.keys(answers).filter(qId => {
          const question = examQuestions?.find((eq: any) => eq.questions?.id === qId);
          return question && answers[qId] === (question.questions as any)?.correct_answer;
        }).length,
        total_questions: totalQuestions
      }
    });

  } catch (error) {
    console.error('Error in exam results API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const examId = searchParams.get('examId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('exam_results')
      .select(`
        id,
        exam_id,
        user_id,
        score,
        max_score,
        time_taken_minutes,
        submitted_at,
        exams (
          id,
          title,
          subject
        ),
        users (
          id,
          nama,
          nisn
        )
      `)
      .order('submitted_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (examId) {
      query = query.eq('exam_id', examId);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: results, error } = await query;

    if (error) {
      console.error('Error fetching exam results:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data hasil ujian' },
        { status: 500 }
      );
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('exam_results')
      .select('id', { count: 'exact', head: true });

    if (userId) countQuery = countQuery.eq('user_id', userId);
    if (examId) countQuery = countQuery.eq('exam_id', examId);

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
    console.error('Error in exam results GET API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
