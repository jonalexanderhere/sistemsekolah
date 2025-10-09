import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Load environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDU1NjAsImV4cCI6MjA3NDk4MTU2MH0.UQ49a5K0Me7-aS5U80bRBLExnx-Hmgpg4X4DMXgZP5Y';

console.log('🔍 Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'EXISTS' : 'MISSING');
console.log('SERVICE_KEY:', supabaseServiceKey ? 'EXISTS' : 'MISSING');
console.log('ANON_KEY:', supabaseAnonKey ? 'EXISTS' : 'MISSING');

// Use service key if available, otherwise fallback to anon key
const keyToUse = supabaseServiceKey || supabaseAnonKey;
console.log('Using key type:', supabaseServiceKey ? 'SERVICE' : 'ANON');

const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, faceEmbedding, userData } = await request.json();

    if (!userId || !faceEmbedding || !Array.isArray(faceEmbedding)) {
      return NextResponse.json(
        { error: 'User ID dan face embedding harus diisi' },
        { status: 400 }
      );
    }

    // Check if user exists, if not create them
    let user;
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, nama')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      // User doesn't exist, create them
      console.log('👤 Creating new user in database:', userId);
      
      const newUserData = {
        id: userId,
        nama: userData?.nama || 'User Terdaftar',
        role: userData?.role || 'siswa',
        nisn: userData?.nisn || `AUTO-${Date.now().toString().slice(-6)}`,
        identitas: userData?.identitas || userData?.email || `${userId}@sisfotjkt2.com`,
        class_name: 'XII TJKT 2',
        face_embedding: faceEmbedding,
        face_registered_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert(newUserData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        console.error('User data being inserted:', newUserData);
        return NextResponse.json(
          { error: 'Gagal membuat user baru', details: createError.message },
          { status: 500 }
        );
      }

      user = createdUser;
      console.log('✅ User created successfully:', user);
    } else {
      // User exists, update with face data
      console.log('👤 Updating existing user:', existingUser);
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          face_embedding: faceEmbedding,
          face_registered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user face embedding:', updateError);
        return NextResponse.json(
          { error: 'Gagal menyimpan data wajah' },
          { status: 500 }
        );
      }

      user = existingUser;
    }

    // Store in faces table for backup/history (only if user_id is a valid UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(userId)) {
      // First, check if user already has a primary face
      const { data: existingFace } = await supabaseAdmin
        .from('faces')
        .select('id')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

      if (existingFace) {
        // Update existing primary face
        const { error: updateError } = await supabaseAdmin
          .from('faces')
          .update({
            embedding: faceEmbedding,
            confidence: 1.0,
            quality_score: 0.9,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFace.id);

        if (updateError) {
          console.error('Error updating face data:', updateError);
        } else {
          console.log('✅ Face data updated successfully');
        }
      } else {
        // Insert new primary face
        const { error: faceError } = await supabaseAdmin
          .from('faces')
          .insert({
            user_id: userId,
            embedding: faceEmbedding,
            is_primary: true,
            is_active: true,
            confidence: 1.0,
            quality_score: 0.9,
            created_at: new Date().toISOString()
          });

        if (faceError) {
          console.error('Error storing face data:', faceError);
        } else {
          console.log('✅ Face data stored successfully');
        }
      }
    } else {
      console.log('⚠️ Skipping faces table insert - userId is not a valid UUID:', userId);
    }

    console.log('✅ Face registration completed successfully for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Wajah berhasil didaftarkan',
      user: user
    });

  } catch (error) {
    console.error('Face registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

