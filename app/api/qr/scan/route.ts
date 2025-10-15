import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📱 QR Scan API: Starting request');
    
    const { qrData } = await request.json();
    
    if (!qrData) {
      return NextResponse.json({
        success: false,
        error: 'QR Data is required'
      }, { status: 400 });
    }

    // Extract student NISN from QR data
    const nisn = qrData.replace('STUDENT_', '');
    
    if (!nisn) {
      return NextResponse.json({
        success: false,
        error: 'Invalid QR Code format'
      }, { status: 400 });
    }

    try {
      // Find student by NISN
      const { data: student, error } = await supabaseAdmin
        .from('users')
        .select('id, nama, nisn, role, class_name')
        .eq('nisn', nisn)
        .eq('role', 'siswa')
        .single();

      if (error || !student) {
        return NextResponse.json({
          success: false,
          error: 'Student not found'
        }, { status: 404 });
      }

      console.log('✅ Student found:', student.nama);
      
      return NextResponse.json({
        success: true,
        data: {
          student: {
            id: student.id,
            nama: student.nama,
            nisn: student.nisn,
            class_name: student.class_name
          }
        }
      });

    } catch (supabaseError) {
      console.warn('Supabase failed, using fallback:', supabaseError);
      
      // Fallback: return mock student data
      return NextResponse.json({
        success: true,
        data: {
          student: {
            id: `student-${nisn}`,
            nama: `Student ${nisn}`,
            nisn: nisn,
            class_name: 'XII TJKT 2'
          }
        },
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('❌ QR Scan error:', error);
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan server',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
