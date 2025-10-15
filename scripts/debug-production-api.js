#!/usr/bin/env node

/**
 * Debug Production API
 * Check what's happening with the attendance API in production
 */

async function debugProductionAPI() {
  console.log('🔍 Debugging Production API...\n');
  
  try {
    // Test 1: Check if the API is using the correct environment
    console.log('📝 Test 1: Check API response structure');
    const response = await fetch('https://sistemsekolah.vercel.app/api/attendance/list?limit=5');
    const data = await response.json();
    
    console.log('📊 Full API Response:');
    console.log(JSON.stringify(data, null, 2));

    // Test 2: Check if there are any errors in the response
    if (data.error) {
      console.log('\n❌ API Error Found:');
      console.log(`  Error: ${data.error}`);
      console.log(`  Details: ${data.details || 'none'}`);
    }

    // Test 3: Check if the source is correct
    if (data.source === 'localStorage') {
      console.log('\n⚠️ API is using localStorage fallback');
      console.log('This means Supabase connection failed in production');
    } else if (data.source === 'supabase') {
      console.log('\n✅ API is using Supabase');
    } else {
      console.log('\n❓ Unknown API source:', data.source);
    }

    // Test 4: Check if there are any records
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Records found:');
      data.data.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} - ${record.tanggal}`);
      });
    } else {
      console.log('\n📭 No records found in API response');
    }

    // Test 5: Check if the API is working with different parameters
    console.log('\n📝 Test 5: Test with different parameters');
    const todayResponse = await fetch('https://sistemsekolah.vercel.app/api/attendance/list?date=2025-10-15&limit=10');
    const todayData = await todayResponse.json();
    
    console.log('📊 Today\'s API Response:');
    console.log(`  Success: ${todayData.success}`);
    console.log(`  Source: ${todayData.source}`);
    console.log(`  Records: ${todayData.data?.length || 0}`);

    console.log('\n🎯 Debug Summary:');
    console.log(`✅ API Response: ${data.success ? 'Success' : 'Failed'}`);
    console.log(`📊 Data Source: ${data.source || 'unknown'}`);
    console.log(`📊 Records: ${data.data?.length || 0}`);
    console.log(`📊 Error: ${data.error || 'none'}`);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run debug
debugProductionAPI().catch(console.error);
