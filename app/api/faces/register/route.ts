import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, faceEmbedding } = await request.json();

    if (!userId || !faceEmbedding || !Array.isArray(faceEmbedding)) {
      return NextResponse.json(
        { error: 'User ID dan face embedding harus diisi' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, nama')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update user with face embedding and registration timestamp
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        face_embedding: faceEmbedding,
        face_registered_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user face embedding:', updateError);
      return NextResponse.json(
        { error: 'Gagal menyimpan data wajah' },
        { status: 500 }
      );
    }

    // Also store in faces table for backup/history
    const { error: faceError } = await supabaseAdmin
      .from('faces')
      .insert({
        user_id: userId,
        embedding: faceEmbedding,
        is_primary: true,
        is_active: true,
        confidence: 1.0,
        quality_score: 0.9
      });

    if (faceError) {
      console.error('Error storing face data:', faceError);
      // Don't fail the request if backup storage fails
    }

    return NextResponse.json({
      success: true,
      message: 'Wajah berhasil didaftarkan'
    });

  } catch (error) {
    console.error('Face registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

