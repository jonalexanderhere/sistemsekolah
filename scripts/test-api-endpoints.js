const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test all API endpoints
async function testAPIEndpoints() {
    console.log('🔍 Testing All API Endpoints...');
    console.log('===============================');
    console.log('');

    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';

    console.log(`🌐 Base URL: ${baseUrl}`);
    console.log('');

    const endpoints = [
        // Authentication
        {
            name: 'Auth Login',
            method: 'POST',
            url: '/api/auth/login',
            body: { identitas: 'test@example.com' },
            expectedStatus: [200, 404] // 404 is OK if user doesn't exist
        },

        // Users
        {
            name: 'Users List',
            method: 'GET',
            url: '/api/users/list',
            expectedStatus: [200]
        },

        // Attendance
        {
            name: 'Attendance List',
            method: 'GET',
            url: '/api/attendance/list?date=2025-10-02&limit=10',
            expectedStatus: [200]
        },
        {
            name: 'Attendance Settings',
            method: 'GET',
            url: '/api/attendance/settings',
            expectedStatus: [200]
        },

        // Announcements
        {
            name: 'Announcements List',
            method: 'GET',
            url: '/api/announcements/list?limit=5',
            expectedStatus: [200]
        },

        // Exams
        {
            name: 'Exams List',
            method: 'GET',
            url: '/api/exams/list',
            expectedStatus: [200]
        },

        // System Logs
        {
            name: 'System Logs',
            method: 'GET',
            url: '/api/system/log?limit=10',
            expectedStatus: [200]
        }
    ];

    let passedTests = 0;
    let totalTests = endpoints.length;

    for (const endpoint of endpoints) {
        try {
            console.log(`🧪 Testing: ${endpoint.name}`);
            console.log(`   ${endpoint.method} ${endpoint.url}`);

            const options = {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (endpoint.body) {
                options.body = JSON.stringify(endpoint.body);
            }

            const response = await fetch(`${baseUrl}${endpoint.url}`, options);
            const status = response.status;

            if (endpoint.expectedStatus.includes(status)) {
                console.log(`   ✅ Status: ${status} (Expected)`);
                
                // Try to parse JSON response
                try {
                    const data = await response.json();
                    console.log(`   📊 Response: ${JSON.stringify(data).substring(0, 100)}...`);
                } catch (jsonError) {
                    console.log(`   📊 Response: Non-JSON or empty`);
                }
                
                passedTests++;
            } else {
                console.log(`   ❌ Status: ${status} (Expected: ${endpoint.expectedStatus.join(' or ')})`);
                
                // Show error response
                try {
                    const errorData = await response.text();
                    console.log(`   🔍 Error: ${errorData.substring(0, 200)}...`);
                } catch (e) {
                    console.log(`   🔍 Error: Could not read response`);
                }
            }

        } catch (error) {
            console.log(`   ❌ Network Error: ${error.message}`);
        }

        console.log('');
    }

    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('');

    if (passedTests === totalTests) {
        console.log('🎉 All API endpoints are working correctly!');
    } else {
        console.log('⚠️  Some API endpoints need attention.');
        console.log('');
        console.log('🔧 Common fixes:');
        console.log('  1. Check Supabase credentials in .env.local');
        console.log('  2. Verify database schema is properly set up');
        console.log('  3. Check if tables exist in Supabase dashboard');
        console.log('  4. Run: npm run setup-database-v2');
        console.log('  5. Run: npm run import-all-users');
    }
}

// Test specific endpoint
async function testEndpoint(url, method = 'GET', body = null) {
    console.log(`🧪 Testing specific endpoint: ${method} ${url}`);
    
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';

    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${baseUrl}${url}`, options);
        const status = response.status;
        
        console.log(`Status: ${status}`);
        
        try {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        } catch (jsonError) {
            const text = await response.text();
            console.log('Response (text):', text);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Test specific endpoint
        const url = args[0];
        const method = args[1] || 'GET';
        const body = args[2] ? JSON.parse(args[2]) : null;
        
        testEndpoint(url, method, body);
    } else {
        // Test all endpoints
        testAPIEndpoints();
    }
}

module.exports = { testAPIEndpoints, testEndpoint };
