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
    const {
      title,
      description,
      subject,
      duration_minutes,
      total_questions,
      max_score,
      start_date,
      end_date,
      is_active,
      created_by
    } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title harus diisi' },
        { status: 400 }
      );
    }

    // Prepare exam data for V3 schema
    const examData: any = {
      title,
      subject: subject || 'General',
      duration_minutes: duration_minutes || 60,
      total_questions: total_questions || 0,
      max_score: max_score || 100,
      is_active: is_active !== undefined ? is_active : true,
      created_by: created_by || '550e8400-e29b-41d4-a716-446655440001' // Default admin
    };

    // Add optional fields
    if (description) examData.description = description;

    // Handle dates
    if (start_date) {
      examData.start_date = new Date(start_date).toISOString();
    } else {
      examData.start_date = new Date().toISOString();
    }

    if (end_date) {
      examData.end_date = new Date(end_date).toISOString();
    } else {
      // Default to 7 days from start date
      const endDate = new Date(examData.start_date);
      endDate.setDate(endDate.getDate() + 7);
      examData.end_date = endDate.toISOString();
    }

    const { data: exam, error } = await supabaseAdmin
      .from('exams')
      .insert(examData)
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
      console.error('Error creating exam:', error);
      return NextResponse.json(
        { error: 'Gagal membuat ujian', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam
    });

  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
