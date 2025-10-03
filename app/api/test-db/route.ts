import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 });
    }

    console.log('✅ Database connection successful');

    // Test attendance table specifically
    const { data: attendanceTest, error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .limit(1);

    if (attendanceError) {
      console.error('❌ Attendance table test failed:', attendanceError);
      return NextResponse.json({
        success: false,
        error: 'Attendance table access failed',
        details: attendanceError.message,
        code: attendanceError.code
      }, { status: 500 });
    }

    console.log('✅ Attendance table access successful');

    return NextResponse.json({
      success: true,
      message: 'Database connection and tables are working correctly',
      tests: {
        users_table: 'OK',
        attendance_table: 'OK'
      }
    });

  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
