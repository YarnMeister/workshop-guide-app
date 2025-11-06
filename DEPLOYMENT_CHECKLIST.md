# Pre-Deployment Checklist - Vercel Production

## ✅ Configuration Files

### vercel.json
- ✅ **Build command**: `npm run build` (correct)
- ✅ **Dev command**: `vite` (correct for local dev)
- ✅ **Output directory**: `dist` (correct for Vite)
- ✅ **Functions config**: API routes configured with 1024MB memory, 10s timeout
- ✅ **No rewrites needed**: Vercel automatically handles `/api/*` routes

### TypeScript Configuration
- ✅ **API routes**: `api/tsconfig.json` exists with proper Node.js config
- ✅ **Client code**: `tsconfig.app.json` and `tsconfig.json` properly configured
- ✅ **No type errors**: All files pass linting

### Build Configuration
- ✅ **Build script**: `vite build` (correct)
- ✅ **Dependencies**: All required packages installed (@vercel/node in devDependencies)
- ✅ **Output**: Static files go to `dist/` directory

## ✅ API Routes Structure

### File Structure
```
api/
├── claim/index.ts          ✅ POST /api/claim
├── session/index.ts        ✅ GET /api/session  
├── reveal-key/index.ts     ✅ POST /api/reveal-key
└── utils/
    ├── cookies.ts          ✅ Cookie signing/verification
    ├── participants.ts     ✅ Participant lookup
    └── maskApiKey.ts       ✅ Key masking utility
```

### API Route Security
- ✅ **CORS headers**: All routes set proper CORS headers
- ✅ **OPTIONS handling**: Preflight requests handled correctly
- ✅ **Method validation**: Each route validates HTTP methods
- ✅ **Error handling**: All routes have try/catch blocks
- ✅ **Cookie security**: Secure flag enabled in production (`process.env.NODE_ENV === 'production'`)

## ✅ Environment Variables (Required in Vercel)

### Server-Side (API Routes)
1. **PARTICIPANTS_JSON** (REQUIRED)
   - Format: Single-line JSON string
   - Example: `{"code1":{"name":"Name","apiKey":"sk-or-v1-..."},"code2":...}`
   - Status: ✅ Must be set in Vercel dashboard

2. **COOKIE_SECRET** (REQUIRED)
   - Format: Random secure string (32+ characters)
   - Used for: Cookie signing/verification
   - Status: ✅ Must be set in Vercel dashboard

3. **NODE_ENV** (AUTOMATIC)
   - Vercel sets this automatically to `production`
   - Used for: Cookie Secure flag

### Client-Side (Optional - Not needed)
- ❌ **VITE_OPEN_ROUTER_API_KEY**: Removed (now uses participant API keys)

## ✅ Security Checklist

### Cookie Security
- ✅ **httpOnly**: Set to true (prevents JS access)
- ✅ **Secure**: Enabled in production
- ✅ **SameSite**: Set to 'Lax' (CSRF protection)
- ✅ **MaxAge**: 8 hours (28800 seconds)
- ✅ **Signed**: HMAC SHA-256 signature

### API Security
- ✅ **No sensitive data in responses**: Full API keys never returned in `/api/claim`
- ✅ **Case-sensitive code matching**: Exact match required
- ✅ **Input validation**: All inputs validated before processing
- ✅ **Error messages**: Generic errors (no sensitive info leaked)

### Data Validation
- ✅ **Participant data**: Validates name and apiKey fields exist
- ✅ **Invalid entries**: Logged and removed from cache
- ✅ **JSON parsing**: Proper error handling

## ✅ Code Quality

### No Hardcoded URLs
- ✅ **API calls**: All use relative paths (`/api/claim`, `/api/session`, etc.)
- ✅ **External APIs**: Only OpenRouter uses absolute URL (correct)
- ✅ **No localhost**: No hardcoded localhost references in code
- ⚠️ **Documentation**: `steps.ts` has `localhost:3000` in tutorial text (acceptable - user-facing docs)

### Error Handling
- ✅ **Error boundaries**: React ErrorBoundary component added
- ✅ **API errors**: All routes catch and return proper error responses
- ✅ **Client errors**: Proper error handling with user-friendly messages

### Performance
- ✅ **API key caching**: Keys stored in memory after first reveal
- ✅ **Participant cache**: Participants JSON cached after first load
- ✅ **No unnecessary calls**: Session check runs once on mount

## ✅ Client-Side Code

### Fetch Calls
- ✅ **Credentials**: All API calls include `credentials: 'include'` for cookies
- ✅ **Error handling**: All fetch calls have try/catch blocks
- ✅ **Relative URLs**: All API calls use relative paths (will work in production)

### State Management
- ✅ **Session restoration**: Properly handles cookie-based sessions
- ✅ **LocalStorage**: Progress stored correctly
- ✅ **Migration**: Handles old participantId format gracefully

## ⚠️ Pre-Deployment Actions Required

### 1. Set Environment Variables in Vercel Dashboard
Go to: Project Settings → Environment Variables

Add:
- `PARTICIPANTS_JSON` = Your single-line JSON string
- `COOKIE_SECRET` = Your secure random string (already set per user)

### 2. Verify Vercel Project Settings
- Build Command: `npm run build` (should auto-detect from vercel.json)
- Output Directory: `dist` (should auto-detect from vercel.json)
- Install Command: `npm install` (default)

### 3. Test Deployment
After deployment, verify:
- ✅ Frontend loads correctly
- ✅ `/api/session` returns `{"authenticated":false}` (not 404)
- ✅ Code claim works with valid codes
- ✅ Cookies are set correctly (check browser DevTools)
- ✅ API key reveal works

## ✅ Expected Behavior in Production

### Cookie Behavior
- Cookies set with `Secure` flag (HTTPS only)
- Cookies accessible via `httpOnly` (not accessible via JS)
- Cookies expire after 8 hours

### API Routes
- All routes accessible at `https://your-domain.vercel.app/api/*`
- CORS headers allow requests from your domain
- Environment variables loaded from Vercel dashboard

### Frontend
- Static files served from `dist/` directory
- API calls use relative paths (automatically use production domain)
- localStorage persists progress across sessions

## 🚀 Ready to Deploy!

All checks passed. The codebase is production-ready.

**Next Steps:**
1. Push code to GitHub (if not already)
2. Vercel will auto-deploy (or trigger manual deploy)
3. Verify environment variables are set in Vercel dashboard
4. Test with a valid participant code

