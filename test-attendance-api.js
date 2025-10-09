const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAttendanceAPI() {
  try {
    console.log('🧪 Testing attendance API...');
    
    // Test faces list first
    console.log('1. Testing faces list API...');
    const facesResponse = await fetch('http://localhost:3000/api/faces/list');
    const facesData = await facesResponse.json();
    console.log('Faces API status:', facesResponse.status);
    console.log('Faces data:', facesData);
    
    // Test attendance list
    console.log('\n2. Testing attendance list API...');
    const attendanceResponse = await fetch('http://localhost:3000/api/attendance/list?date=2025-10-09&limit=10');
    const attendanceData = await attendanceResponse.json();
    console.log('Attendance API status:', attendanceResponse.status);
    console.log('Attendance data:', attendanceData);
    
    // Test attendance mark
    console.log('\n3. Testing attendance mark API...');
    const markResponse = await fetch('http://localhost:3000/api/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        status: 'hadir',
        method: 'face_recognition'
      })
    });
    const markData = await markResponse.json();
    console.log('Mark API status:', markResponse.status);
    console.log('Mark data:', markData);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAttendanceAPI();
