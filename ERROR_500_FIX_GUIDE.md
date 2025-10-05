# Error 500 Fix Guide - SISFOTJKT2

## 🚨 **Problem Identified**
Error 500 terjadi karena `SUPABASE_SERVICE_ROLE_KEY` menggunakan placeholder value yang tidak valid.

## 🔧 **Immediate Fix Required**

### **Step 1: Update Environment Variables**
```bash
# Edit .env.local file and replace:
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# With your actual service role key from Supabase dashboard
```

### **Step 2: Get Service Role Key**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings > API**
4. Copy the **service_role** key
5. Paste it in `.env.local`

### **Step 3: Verify Setup**
```bash
# Test API routes
node scripts/test-api-routes.js

# Check environment variables
node scripts/fix-environment-variables.js
```

## 🛠️ **Technical Improvements Made**

### **1. Fallback Client Mechanism**
```typescript
// API routes now try admin client first, fallback to anon client
let query;
let clientToUse = supabaseAdmin;

try {
  await supabaseAdmin.from('users').select('id').limit(1);
  query = supabaseAdmin;
} catch (adminError) {
  console.warn('Admin client failed, using fallback client');
  query = supabaseFallback;
  clientToUse = supabaseFallback;
}
```

### **2. Error Boundary Added**
- Global error boundary in `app/layout.tsx`
- Catches and logs all frontend errors
- Provides user-friendly error messages
- Automatic error reporting to `/api/system/log`

### **3. Enhanced Error Handling**
- API routes return detailed error information
- Proper error logging with context
- Graceful degradation when services fail

## 📊 **Error Prevention Measures**

### **Environment Variables Validation**
```javascript
// In lib/supabase.ts
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}
```

### **Database Connection Testing**
```javascript
// API routes test connection before queries
try {
  await supabaseAdmin.from('users').select('id').limit(1);
} catch (error) {
  // Fallback to anon client
  console.warn('Admin client failed, using fallback');
}
```

### **API Response Enhancement**
```typescript
// API responses include fallback status
{
  success: true,
  data: [...],
  usingFallback: false, // Shows if fallback client was used
  error: null
}
```

## 🚀 **Production Deployment**

### **Environment Variables for Production**
```env
# Required for production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional optimizations
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### **Database Setup Order**
1. ✅ Create Supabase project
2. ✅ Run schema SQL script
3. ✅ Update environment variables
4. ✅ Deploy application
5. ✅ Test API endpoints

## 🔍 **Debugging Tools**

### **1. API Route Testing**
```bash
node scripts/test-api-routes.js
```

### **2. Environment Check**
```bash
node scripts/fix-environment-variables.js
```

### **3. Database Verification**
```bash
node scripts/verify-database-setup.js
```

### **4. Browser Console**
Open browser dev tools and check:
- Network tab for 500 errors
- Console for error messages
- Application tab for localStorage issues

## 📋 **Common Error Patterns**

### **Error: "JWT expired"**
- **Cause:** Service role key expired
- **Fix:** Generate new service role key in Supabase dashboard

### **Error: "Invalid API key"**
- **Cause:** Wrong service role key format
- **Fix:** Copy exact key from Supabase dashboard

### **Error: "Table does not exist"**
- **Cause:** Database schema not applied
- **Fix:** Run SQL schema in Supabase SQL editor

### **Error: "Permission denied"**
- **Cause:** RLS policies blocking access
- **Fix:** Check RLS policies in database

## 🎯 **Verification Checklist**

- [ ] ✅ Supabase project created and accessible
- [ ] ✅ Service role key updated in .env.local
- [ ] ✅ Database schema applied
- [ ] ✅ API routes tested successfully
- [ ] ✅ No 500 errors in browser console
- [ ] ✅ Face recognition working
- [ ] ✅ Attendance system functional

## 🚨 **Urgent Actions Required**

1. **Update .env.local** with correct `SUPABASE_SERVICE_ROLE_KEY`
2. **Restart Next.js dev server** after updating environment variables
3. **Test API routes** using the provided test script
4. **Verify database connection** in Supabase dashboard

## 💡 **Next Steps**

1. Update environment variables
2. Restart development server
3. Test all functionality
4. Deploy to production when ready

---

**Note:** Error 500 akan hilang setelah `SUPABASE_SERVICE_ROLE_KEY` diisi dengan key yang valid dari Supabase dashboard.
