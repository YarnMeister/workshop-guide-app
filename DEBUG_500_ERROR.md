# Production 500 Error - Diagnostic Steps

## Current Status
Functions are returning HTML error pages instead of JSON, suggesting they're crashing before our handler code executes.

## Immediate Actions

### 1. Test the Simple Endpoint
After deployment, test: `https://your-domain.vercel.app/api/test`

This should return:
```json
{
  "success": true,
  "message": "API is working",
  "env": {
    "hasCookieSecret": true/false,
    "hasParticipantsJson": true/false
  }
}
```

If this works → The issue is with imports/modules in other endpoints
If this fails → The issue is with Vercel function deployment itself

### 2. Check Vercel Function Logs

**Critical**: Check the actual error in Vercel logs:

1. Go to: Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Click "Functions" tab  
4. Click on `/api/claim` function
5. Check "Logs" section
6. Look for the actual error message

Common errors you might see:
- `Cannot find module './utils/cookies'` → Import path issue
- `COOKIE_SECRET not configured` → Module-level error being thrown
- `SyntaxError` → TypeScript compilation issue
- `MODULE_NOT_FOUND` → Missing dependency

### 3. Verify Environment Variables Again

Make sure variables are set for **Production** environment:
- Variables set for "Production" specifically (not just Preview/Development)
- `PARTICIPANTS_JSON` format is correct (single-line JSON)
- No extra quotes or escaping issues

### 4. Check Deployment Build Logs

1. Go to: Vercel Dashboard → Deployments → Latest
2. Check "Build Logs" tab
3. Look for:
   - TypeScript compilation errors
   - Missing dependencies
   - Build warnings

### 5. Potential Fixes Based on Errors

**If logs show module import errors:**
- May need to adjust import paths
- Check if relative imports work (they should)

**If logs show environment variable errors:**
- Verify variables are set correctly
- Check for hidden characters or encoding issues
- Ensure variables are for Production environment

**If logs show TypeScript errors:**
- May need to add explicit runtime configuration
- Check if api/tsconfig.json is being used

## Next Steps

1. ✅ Test `/api/test` endpoint first
2. ✅ Check function logs for actual error
3. ✅ Share the error message from logs
4. ✅ Fix based on specific error

The test endpoint will help isolate whether it's:
- A general deployment issue (test fails)
- A specific module/import issue (test works, others fail)

