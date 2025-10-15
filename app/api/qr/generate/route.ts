import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 QR Generate API: Starting request');
    
    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID is required'
      }, { status: 400 });
    }

    try {
      // Get student data from Supabase
      const { data: student, error } = await supabaseAdmin
        .from('users')
        .select('id, nama, nisn, role, class_name')
        .eq('id', studentId)
        .eq('role', 'siswa')
        .single();

      if (error || !student) {
        return NextResponse.json({
          success: false,
          error: 'Student not found'
        }, { status: 404 });
      }

      // Generate QR data
      const qrData = `STUDENT_${student.nisn}`;
      
      console.log('✅ QR Code generated for student:', student.nama);
      
      return NextResponse.json({
        success: true,
        data: {
          qrData,
          student: {
            id: student.id,
            nama: student.nama,
            nisn: student.nisn,
            class_name: student.class_name
          }
        }
      });

    } catch (supabaseError) {
      console.error('❌ Supabase connection failed:', supabaseError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ QR Generate error:', error);
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, qrData } = await request.json();
    
    if (!studentId || !qrData) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and QR Data are required'
      }, { status: 400 });
    }

    try {
      // Store QR data in database (optional)
      const { error } = await supabaseAdmin
        .from('users')
        .update({ qr_code: qrData })
        .eq('id', studentId);

      if (error) {
        console.warn('Failed to update QR code in database:', error);
      }

      return NextResponse.json({
        success: true,
        message: 'QR Code generated successfully',
        data: { qrData, studentId }
      });

    } catch (supabaseError) {
      console.error('❌ Supabase connection failed:', supabaseError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ QR Generate POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
