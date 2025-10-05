import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
        student_id,
        assignment_name,
        subject,
        grade,
        max_grade,
        date,
        notes,
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
      query = query.eq('teacher_id', teacherId);
    }

    if (studentId) {
      query = query.eq('student_id', studentId);
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

    if (teacherId) countQuery = countQuery.eq('teacher_id', teacherId);
    if (studentId) countQuery = countQuery.eq('student_id', studentId);
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
    const { student_id, assignment_name, subject, grade, max_grade, date, notes, teacher_id } = body;

    if (!student_id || !assignment_name || !subject || !grade || !teacher_id) {
      return NextResponse.json(
        { error: 'Data wajib diisi' },
        { status: 400 }
      );
    }

    const { data: gradeData, error } = await supabaseAdmin
      .from('grades')
      .insert({
        student_id,
        teacher_id,
        assignment_name,
        subject,
        grade: parseFloat(grade),
        max_grade: parseFloat(max_grade) || 100,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating grade:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan nilai' },
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
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
