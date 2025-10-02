import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { nisn, identitas } = await request.json();

    if (!nisn && !identitas) {
      return NextResponse.json(
        { error: 'NISN atau identitas harus diisi' },
        { status: 400 }
      );
    }

    // Find user by NISN or identitas
    let query = supabaseAdmin.from('users').select('*');
    
    if (nisn) {
      query = query.eq('nisn', nisn);
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

    // Return user data (without sensitive info)
    const userData = {
      id: user.id,
      nama: user.nama,
      role: user.role,
      nisn: user.nisn,
      identitas: user.identitas,
      has_face: !!user.face_embedding
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

