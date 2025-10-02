import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
    let query = supabaseAdmin.from('users').select('*');
    
    if (nisn || nip) {
      // For teachers, NIP is stored in nisn field
      // For students, NISN is stored in nisn field
      query = query.eq('nisn', nisn || nip);
    } else if (identitas) {
      query = query.eq('identitas', identitas);
    }

    const { data: user, error } = await query.single();

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
      has_face: !!user.face_embedding,
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

