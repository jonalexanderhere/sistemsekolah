import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { faceEmbedding, threshold = 0.6 } = await request.json();

    if (!faceEmbedding || !Array.isArray(faceEmbedding)) {
      return NextResponse.json(
        { error: 'Face embedding harus diisi' },
        { status: 400 }
      );
    }

    // Get all users with face embeddings
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, nama, role, nisn, face_embedding')
      .not('face_embedding', 'is', null);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data pengguna' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada wajah terdaftar'
      });
    }

    // Calculate distances to all known faces
    let bestMatch = null;
    let bestDistance = threshold;

    for (const user of users) {
      if (!user.face_embedding) continue;

      // Calculate Euclidean distance
      const distance = calculateEuclideanDistance(faceEmbedding, user.face_embedding);
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = {
          id: user.id,
          nama: user.nama,
          role: user.role,
          nisn: user.nisn,
          confidence: 1 - distance,
          distance: distance
        };
      }
    }

    if (bestMatch) {
      return NextResponse.json({
        success: true,
        match: bestMatch
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Wajah tidak dikenali'
      });
    }

  } catch (error) {
    console.error('Face recognition error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

function calculateEuclideanDistance(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

