const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('🧪 Testing API route directly...');
    
    const response = await fetch('http://localhost:3000/api/faces/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '550e8400-e29b-41d4-a716-446655440004',
        faceEmbedding: [0.1, 0.2, 0.3, 0.4, 0.5],
        userData: {
          nama: 'Test User 5',
          role: 'siswa',
          nisn: 'TEST127'
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ API test successful:', data);
    } else {
      console.error('❌ API test failed:', text);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPI();
