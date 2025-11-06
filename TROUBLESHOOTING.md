# Production 500 Error Troubleshooting

## Issue
API routes returning 500 errors with HTML error pages instead of JSON.

## Likely Causes

### 1. Missing Environment Variables ❌ **MOST LIKELY**

The API routes require these environment variables in Vercel:
- `COOKIE_SECRET` - Must be set
- `PARTICIPANTS_JSON` - Must be set

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify both variables are set for **Production** environment
3. Redeploy after adding/updating variables

### 2. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "Functions" tab
4. Click on `/api/claim` or `/api/session`
5. Check the logs for error messages

Look for:
- `COOKIE_SECRET environment variable not set`
- `PARTICIPANTS_JSON environment variable not set`
- Any other runtime errors

### 3. Verify Environment Variable Format

**PARTICIPANTS_JSON:**
- Must be a **single-line** JSON string
- Example: `{"code1":{"name":"Name","apiKey":"sk-or-v1-..."}}`
- NO line breaks inside the JSON

**COOKIE_SECRET:**
- Must be a secure random string (32+ characters)
- Should match what you have locally

### 4. Redeploy After Variable Changes

After updating environment variables:
- Vercel will auto-redeploy OR
- Manually trigger a redeploy from the dashboard

### 5. Test the Fix

After redeploy:
1. Open browser DevTools → Network tab
2. Try entering a participant code
3. Check `/api/claim` response:
   - Should return JSON: `{"success": true, ...}` or `{"success": false, "error": "..."}`
   - Should NOT return HTML error page

## Quick Diagnostic

Run this in your browser console on the production site:
```javascript
fetch('/api/session')
  .then(r => r.text())
  .then(console.log)
```

If you see HTML instead of JSON, the function is crashing before returning JSON.

## Next Steps

1. ✅ Check Vercel environment variables (Dashboard → Settings → Environment Variables)
2. ✅ Check function logs for specific error messages
3. ✅ Verify variable format (single-line JSON for PARTICIPANTS_JSON)
4. ✅ Redeploy if variables were updated
5. ✅ Test again

The updated code now has better error messages that will help diagnose the issue in the Vercel logs.

