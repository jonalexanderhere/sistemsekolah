const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testFaceRegister() {
  try {
    console.log('🧪 Testing face registration...');
    
    const userId = '550e8400-e29b-41d4-a716-446655440002';
    const faceEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
    const userData = {
      nama: 'Test User 3',
      role: 'siswa',
      nisn: 'TEST125',
      identitas: 'test3@sisfotjkt2.com',
      class_name: 'XII TJKT 2'
    };

    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, nama')
      .eq('id', userId)
      .single();

    console.log('User check result:', { existingUser, userError });

    if (userError || !existingUser) {
      // Create user
      console.log('👤 Creating new user...');
      const newUserData = {
        id: userId,
        nama: userData.nama,
        role: userData.role,
        nisn: userData.nisn,
        identitas: userData.identitas,
        class_name: userData.class_name,
        face_embedding: faceEmbedding,
        face_registered_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError);
        return;
      }

      console.log('✅ User created successfully:', createdUser);
    } else {
      // Update user
      console.log('👤 Updating existing user...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          face_embedding: faceEmbedding,
          face_registered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        return;
      }

      console.log('✅ User updated successfully');
    }

    // Test faces table insert
    console.log('🔍 Testing faces table insert...');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(userId)) {
      const { error: faceError } = await supabase
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
        console.error('❌ Error storing face data:', faceError);
      } else {
        console.log('✅ Face data stored successfully');
      }
    } else {
      console.log('⚠️ Skipping faces table insert - userId is not a valid UUID');
    }

    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFaceRegister();
