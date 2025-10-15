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
  return NextResponse.json({ 
    message: 'Login API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const { nisn, nip, identitas } = await request.json();

    if (!nisn && !nip && !identitas) {
      return NextResponse.json(
        { error: 'NISN/NIP atau identitas harus diisi' },
        { status: 400 }
      );
    }

    // Find user by NISN/NIP or identitas
    let user = null;
    let error = null;

    if (nisn || nip) {
      // Try to find by NISN/NIP first
      let query = supabaseAdmin.from('users').select('*');
      
      if (nisn) {
        query = query.eq('nisn', nisn);
      } else if (nip) {
        query = query.eq('nip', nip);
      }
      
      const { data: userData, error: userError } = await query.single();
      
      user = userData;
      error = userError;
    } else if (identitas) {
      // Try to find by identitas
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('identitas', identitas)
        .single();
      
      user = userData;
      error = userError;
    }

    if (error || !user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Determine redirect URL based on role
    let redirectUrl = '/';
    switch (user.role) {
      case 'admin':
        redirectUrl = '/admin-dashboard';
        break;
      case 'guru':
        redirectUrl = '/teacher-dashboard';
        break;
      case 'siswa':
        redirectUrl = '/';
        break;
      default:
        redirectUrl = '/';
    }

    // Return user data (without sensitive info)
    const userData = {
      id: user.id,
      nama: user.nama,
      role: user.role,
      nisn: user.nisn,
      identitas: user.identitas,
      email: user.email,
      class_name: user.class_name,
      is_active: user.is_active,
      is_verified: user.is_verified
    };

    return NextResponse.json({
      success: true,
      user: userData,
      redirect: redirectUrl,
      message: `Selamat datang, ${user.nama}!`
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

