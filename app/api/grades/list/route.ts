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
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const subject = searchParams.get('subject');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('grades')
      .select(`
        id,
        user_id,
        subject,
        assignment_type,
        score,
        max_score,
        semester,
        academic_year,
        teacher_notes,
        created_at,
        users!inner (
          id,
          nama,
          nisn,
          class_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (teacherId) {
      query = query.eq('created_by', teacherId);
    }

    if (studentId) {
      query = query.eq('user_id', studentId);
    }

    if (subject) {
      query = query.eq('subject', subject);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: grades, error } = await query;

    if (error) {
      console.error('Error fetching grades:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data nilai' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('grades')
      .select('id', { count: 'exact', head: true });

    if (teacherId) countQuery = countQuery.eq('created_by', teacherId);
    if (studentId) countQuery = countQuery.eq('user_id', studentId);
    if (subject) countQuery = countQuery.eq('subject', subject);

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting grades:', countError);
    }

    return NextResponse.json({
      success: true,
      data: grades || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Grades list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, subject, assignment_type, score, max_score, semester, academic_year, teacher_notes, created_by } = body;

    if (!user_id || !subject || !assignment_type || !score || !created_by) {
      return NextResponse.json(
        { error: 'Data wajib diisi' },
        { status: 400 }
      );
    }

    const { data: gradeData, error } = await supabaseAdmin
      .from('grades')
      .insert({
        user_id,
        subject,
        assignment_type,
        score: parseFloat(score),
        max_score: parseFloat(max_score) || 100,
        semester: semester || 'Ganjil',
        academic_year: academic_year || '2024/2025',
        teacher_notes: teacher_notes || null,
        created_by
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating grade:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan nilai', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gradeData,
      message: 'Nilai berhasil disimpan'
    });

  } catch (error) {
    console.error('Grade creation error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
