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
    const { searchParams } = request.nextUrl;
    const examId = searchParams.get('examId');
    const questionType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('questions')
      .select(`
        id,
        question_text,
        question_type,
        options,
        correct_answer,
        points,
        subject,
        difficulty,
        created_by,
        created_at
      `)
      .order('created_at', { ascending: false });

    // Apply filters
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
      question_text,
      question_type,
      options,
      correct_answer,
      points,
      subject,
      difficulty,
      created_by
    } = body;

    if (!question_text || !question_type || !points || !created_by) {
      return NextResponse.json(
        { error: 'Data wajib diisi' },
        { status: 400 }
      );
    }

    const { data: questionData, error } = await supabaseAdmin
      .from('questions')
      .insert({
        question_text,
        question_type,
        options: options || null,
        correct_answer: correct_answer || null,
        points: parseFloat(points),
        subject: subject || null,
        difficulty: difficulty || 'medium',
        created_by
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan soal', details: error.message },
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
      { error: 'Terjadi kesalahan server', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
