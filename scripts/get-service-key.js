#!/usr/bin/env node

console.log('🔑 Supabase Service Role Key Helper');
console.log('=' .repeat(50));

console.log('\n📋 LANGKAH-LANGKAH MENDAPATKAN SERVICE ROLE KEY:');
console.log('\n1. Buka browser dan kunjungi:');
console.log('   https://supabase.com/dashboard/project/kfstxlcoegqanytvpbgp/settings/api');

console.log('\n2. Login ke akun Supabase Anda');

console.log('\n3. Di halaman API Settings, cari bagian "Project API keys"');

console.log('\n4. Cari key dengan label "service_role" (BUKAN anon/public)');

console.log('\n5. Klik tombol "Reveal" atau "Copy" pada service_role key');

console.log('\n6. Copy key tersebut dan paste ke .env.local');

console.log('\n⚠️  PENTING:');
console.log('   - Service role key berbeda dengan anon key');
console.log('   - Service role key dimulai dengan: eyJhbGciOiJIUzI1NiI...');
console.log('   - Di dalam JWT payload ada: "role":"service_role"');

console.log('\n🔍 CARA MEMBEDAKAN:');
console.log('   Anon Key (Public):     ...role":"anon"...');
console.log('   Service Role (Private): ...role":"service_role"...');

console.log('\n📝 EDIT FILE .env.local:');
console.log('   Ganti baris:');
console.log('   SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_HERE');
console.log('   Dengan:');
console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...(key yang Anda copy)');

console.log('\n🚀 SETELAH MENGEDIT:');
console.log('   1. Save file .env.local');
console.log('   2. Jalankan: npm run full-setup');
console.log('   3. Ikuti instruksi selanjutnya');

console.log('\n🆘 JIKA TIDAK BISA AKSES:');
console.log('   - Pastikan Anda memiliki akses ke project Supabase');
console.log('   - Atau buat project Supabase baru dan update konfigurasi');

console.log('\n' + '=' .repeat(50));
console.log('Setelah mendapatkan key, jalankan: npm run full-setup');
