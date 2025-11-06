# Implementation Proposal: Participant Code → Key Lookup System

## Executive Summary

This document outlines the design and implementation plan for adding a secure participant code validation and API key lookup system to the Vite workshop guide app. The system will use Vercel serverless functions to validate participant codes against a server-side guest list and securely distribute personalized API keys without exposing the full participant database to the client.

---

## Current State Analysis

### Existing Architecture

1. **Frontend Structure**
   - Vite + React + TypeScript
   - React Router for navigation
   - localStorage for progress persistence (`workshop_progress` key)
   - Current Welcome page collects `participantId` as free-text input
   - Hardcoded API key `"sk-ar3x-pkxX8c-erCr9-cvD-rr4R"` displayed in `src/data/steps.ts` (line 51)
   - OpenRouter service uses `import.meta.env.VITE_OPEN_ROUTER_API_KEY` (client-side env var)

2. **Storage Pattern**
   - `WorkshopProgress` interface tracks `participantId`, step progress, PRD answers, etc.
   - Uses `useWorkshopProgress` hook for state management
   - localStorage key: `workshop_progress`

3. **Missing Components**
   - No server-side API routes
   - No cookie-based session management
   - No participant code validation
   - No secure key distribution mechanism

---

## Proposed Architecture

### 1. Server-Side Infrastructure (Vercel Functions)

#### File Structure
```
/api
  /claim
    index.ts          # POST /api/claim - Validate code & set session
  /session
    index.ts          # GET /api/session - Restore session from cookie
  /reveal-key
    index.ts          # POST /api/reveal-key - Retrieve full API key
  /utils
    participants.ts   # Load & parse PARTICIPANTS_JSON
    cookies.ts         # Cookie signing/verification helpers
    rateLimit.ts      # Optional IP-based rate limiting
```

#### API Endpoints

##### `POST /api/claim`
**Purpose:** Validate participant code and establish session

**Request:**
```json
{
  "code": "9fA#2"
}
```

**Response (Success):**
```json
{
  "success": true,
  "participantId": "9fA#2",
  "name": "Jane Doe",
  "apiKeyMasked": "sk-or-v1-**********"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid code"
}
```

**Behavior:**
- Parse `PARTICIPANTS_JSON` environment variable
- Lookup code (handle special characters safely)
- If found: set httpOnly cookie with signed payload `{ code, name, participantId }`
- Return masked key (first 8 chars + asterisks)
- Never return full API key in this response
- Set cookie attributes: `httpOnly`, `Secure`, `SameSite=Lax`, `maxAge: 28800` (8 hours)

##### `GET /api/session`
**Purpose:** Restore user session for UI personalization

**Request:** None (uses cookie)

**Response (Success):**
```json
{
  "authenticated": true,
  "participantId": "9fA#2",
  "name": "Jane Doe"
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

**Behavior:**
- Read and verify signed cookie
- Return participant info (no API key)
- Used on app boot to restore personalization

##### `POST /api/reveal-key`
**Purpose:** Retrieve full API key for copying (requires valid session)

**Request:** None (uses cookie)

**Response (Success):**
```json
{
  "success": true,
  "apiKey": "sk-or-v1-abcdef1234567890...",
  "apiKeyMasked": "sk-or-v1-**********"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Session expired" | "Invalid session" | "Rate limited"
}
```

**Behavior:**
- Verify cookie authentication
- Lookup participant record again
- Return full unmasked key
- Optional rate limiting (e.g., 10 requests per hour per IP)

---

### 2. Client-Side Changes

#### New Files
```
src/
  services/
    participant.ts      # API client for participant endpoints
  hooks/
    useParticipant.ts   # Hook for participant state & actions
  context/
    ParticipantContext.tsx  # Optional: context for global participant state
```

#### Modified Files

##### `src/pages/Welcome.tsx`
**Changes:**
- Replace free-text `participantId` input with `code` input field
- Add form validation and error handling
- On submit: call `/api/claim`
- On success:
  - Store `{ participantId, name, apiKeyMasked }` in localStorage
  - Update `WorkshopProgress` with `participantId` and `name`
  - Show success toast: "Welcome, {name}!"
  - Navigate to onboarding step 1

##### `src/pages/OnboardingStep.tsx` (Step 1 - Setup Page)
**Changes:**
- Display personalized greeting: "Welcome {name}," at top of page
- Replace hardcoded key in `steps.ts` with dynamic masked key from participant state
- Add "Copy Full Key" button that calls `/api/reveal-key`
- Show masked key by default: `sk-or-v1-**********`
- On "Copy Full Key" click:
  - Call `/api/reveal-key`
  - Copy full key to clipboard
  - Show toast confirmation
  - Keep key in memory only (no localStorage persistence)

##### `src/services/openrouter.ts`
**Changes:**
- Remove dependency on `VITE_OPEN_ROUTER_API_KEY`
- Retrieve API key from participant context/hook
- If no key available, show error: "Please enter your participant code on the Welcome page"

##### `src/utils/storage.ts`
**Changes:**
- Extend `WorkshopProgress` interface:
  ```typescript
  interface WorkshopProgress {
    participantId: string | null;
    participantName: string | null;  // NEW
    apiKeyMasked: string | null;     // NEW (for display only)
    // ... existing fields
  }
  ```
- Update `clearProgress()` to also clear session cookie (via API call)

##### `src/components/Header.tsx`
**Changes:**
- Optionally display participant name: "Welcome, {name}"

---

### 3. Security Considerations

#### Cookie Security
- **Signing:** Use a secret key (e.g., `COOKIE_SECRET` env var) to sign cookies
- **Payload:** Store minimal data: `{ code, name, participantId }` (no API keys)
- **Attributes:**
  - `httpOnly: true` - Prevents JavaScript access
  - `Secure: true` - HTTPS only (production)
  - `SameSite: 'Lax'` - CSRF protection
  - `maxAge: 28800` - 8 hour expiration

#### Environment Variables

**Server-side (Vercel):**
- `PARTICIPANTS_JSON` - Single-line JSON string with participant data
- `COOKIE_SECRET` - Secret for signing cookies (generate random string)
- `NODE_ENV` - Set to `production` on Vercel

**Local Development (.env.local):**
```bash
PARTICIPANTS_JSON='{"9fA#2":{"name":"Jane Doe","apiKey":"sk-or-v1-abc123..."},"code2":{"name":"John Smith","apiKey":"sk-or-v1-xyz789..."}}'
COOKIE_SECRET=your-local-dev-secret-key-here
```

**Client-side (NONE):**
- Do NOT expose `PARTICIPANTS_JSON` via `VITE_*` env vars
- Remove `VITE_OPEN_ROUTER_API_KEY` usage

#### Rate Limiting (Optional)
- Implement IP-based rate limiting for `/api/claim` and `/api/reveal-key`
- Suggested limits:
  - `/api/claim`: 5 attempts per hour per IP
  - `/api/reveal-key`: 10 requests per hour per IP
- Use in-memory Map or simple JSON file for tracking (Vercel functions are stateless, so this is soft limiting)

#### Data Validation
- Sanitize participant codes (handle special characters via URL encoding/decoding)
- Validate JSON structure before parsing
- Error handling for malformed `PARTICIPANTS_JSON`

---

### 4. Data Flow Diagrams

#### Initial Claim Flow
```
User enters code → Welcome.tsx
  ↓
POST /api/claim { code: "9fA#2" }
  ↓
Server: Lookup in PARTICIPANTS_JSON
  ↓
If found:
  - Set signed cookie { code, name }
  - Return { participantId, name, apiKeyMasked }
  ↓
Client: Store in localStorage + WorkshopProgress
  ↓
Navigate to Step 1
```

#### Key Reveal Flow
```
User clicks "Copy Full Key" → OnboardingStep.tsx
  ↓
POST /api/reveal-key (with cookie)
  ↓
Server: Verify cookie signature
  ↓
Server: Lookup participant record
  ↓
Return { apiKey, apiKeyMasked }
  ↓
Client: Copy to clipboard (memory only)
```

#### Session Restoration Flow
```
App boot → App.tsx / Welcome.tsx
  ↓
GET /api/session (with cookie)
  ↓
Server: Verify cookie
  ↓
If valid:
  Return { participantId, name }
  ↓
Client: Restore personalization
Client: Skip Welcome page if authenticated
```

---

### 5. Implementation Phases

#### Phase 1: Server Infrastructure
1. Create `/api` directory structure
2. Implement `/api/claim` endpoint
3. Implement `/api/session` endpoint
4. Implement `/api/reveal-key` endpoint
5. Add cookie signing utilities
6. Set up environment variable parsing

#### Phase 2: Client Integration
1. Create `participant.ts` service module
2. Create `useParticipant` hook
3. Update `Welcome.tsx` for code input
4. Update `OnboardingStep.tsx` (Step 1) for personalized display
5. Update `openrouter.ts` to use participant key
6. Extend `storage.ts` types

#### Phase 3: UI/UX Enhancements
1. Add loading states
2. Add error handling UI
3. Add "Copy Full Key" button styling
4. Update Header with name display
5. Add session expiration handling

#### Phase 4: Testing & Polish
1. Test with `vercel dev` locally
2. Test special character codes
3. Test cookie expiration
4. Test rate limiting (if implemented)
5. Verify no key leakage in network tab
6. Test production deployment

---

### 6. Edge Cases & Error Handling

#### Invalid Code
- Show inline error: "We can't find that code. Please check your code or ask a facilitator."
- Clear input field
- Allow retry

#### Rate Limited
- Show toast: "Too many attempts. Please try again in a minute."
- Disable submit button temporarily

#### Session Expired
- Detect on `/api/session` call
- Show message: "Your session has expired. Please re-enter your code."
- Redirect to Welcome page
- Clear localStorage

#### Network Errors
- Show generic error: "Connection error. Please check your internet and try again."
- Allow retry

#### Malformed PARTICIPANTS_JSON
- Server logs error
- Returns 500 with generic message
- Client shows: "Service temporarily unavailable. Please contact support."

#### Cookie Issues
- If cookie missing on `/api/reveal-key`, prompt to re-enter code
- Handle cookie parsing errors gracefully

---

### 7. Migration Strategy

#### Data Migration
- Existing users with `participantId` in localStorage:
  - On app boot, check for old `participantId` without `name`
  - Prompt: "Please re-enter your participant code to continue"
  - Or: Try to validate old ID against new system (if codes match format)

#### Backward Compatibility
- Keep `participantId` field in `WorkshopProgress` (reused for new system)
- Maintain localStorage structure for progress tracking
- Existing progress data remains valid

---

### 8. Vercel Configuration

#### `vercel.json` (if needed)
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

#### Environment Variables Setup
1. **Vercel Dashboard:**
   - Add `PARTICIPANTS_JSON` (single-line JSON)
   - Add `COOKIE_SECRET` (generate secure random string)

2. **Local `.env.local`:**
   - Same structure as above
   - Use `vercel dev` to test locally

---

### 9. Testing Checklist

#### Functional Tests
- [ ] Valid code claims successfully
- [ ] Invalid code shows error
- [ ] Masked key displays correctly
- [ ] "Copy Full Key" retrieves and copies key
- [ ] Session persists across page reloads
- [ ] Session expires after 8 hours
- [ ] Special character codes work (e.g., `9fA#2`)
- [ ] Welcome page shows personalized greeting
- [ ] Setup page shows participant name

#### Security Tests
- [ ] PARTICIPANTS_JSON not in client bundle
- [ ] Full API key never in localStorage
- [ ] Cookie is httpOnly and Secure
- [ ] Network requests don't expose full participant list
- [ ] Rate limiting works (if implemented)

#### Integration Tests
- [ ] Works with `vercel dev` locally
- [ ] Works on Vercel production
- [ ] OpenRouter service uses participant key correctly
- [ ] Progress persistence still works
- [ ] Reset action clears participant data

---

### 10. Dependencies

#### New Packages (if needed)
- `@vercel/node` - Already available in Vercel runtime
- `iron-session` or `cookie-signature` - For cookie signing (or use Node.js built-in `crypto`)
- Optional: Rate limiting library (or implement simple Map-based solution)

#### Runtime Requirements
- Node.js 18+ (Vercel default)
- TypeScript support for API routes

---

## Clarifying Questions

### 1. Cookie Secret Management
- **Q:** Should we generate `COOKIE_SECRET` randomly or use a specific format?
- **Recommendation:** Use a strong random string (32+ characters). Suggest generating one during setup.

### 2. Rate Limiting Implementation
- **Q:** Should we implement rate limiting, or is it optional?
- **Recommendation:** Implement basic IP-based rate limiting using in-memory Map (note: resets on function cold start, but provides basic protection).

### 3. Participant Code Format
- **Q:** What format are participant codes? (e.g., always contain special chars, or mixed?)
- **Recommendation:** URL-encode/decode codes to handle all special characters safely.

### 4. Session Expiration UX
- **Q:** Should expired sessions auto-redirect to Welcome, or show a modal?
- **Recommendation:** Show toast notification and redirect to Welcome page.

### 5. Reset Functionality
- **Q:** Should "Reset" clear the cookie server-side, or just localStorage?
- **Recommendation:** Clear localStorage only. Cookie expires naturally. Optionally add `/api/logout` endpoint.

### 6. Error Messages
- **Q:** Should error messages be user-friendly or technical?
- **Recommendation:** User-friendly messages for UX, detailed errors in server logs.

### 7. API Key Masking Format
- **Q:** What masking format? (e.g., `sk-or-v1-**********` or `sk-or-v1-abc**********`?)
- **Recommendation:** Show first 8 characters + asterisks: `sk-or-v1-**********` (fully masked except prefix).

### 8. Multiple Device Support
- **Q:** Should users be able to use the same code on multiple devices?
- **Recommendation:** Yes, allow multiple sessions (each device gets its own cookie).

### 9. Progress Migration
- **Q:** If a user already has progress with an old `participantId`, how should we handle it?
- **Recommendation:** On first load after update, prompt to re-enter code. If code matches old ID format, migrate automatically.

### 10. Vercel Dev Setup
- **Q:** Should we include instructions for setting up `vercel dev`?
- **Recommendation:** Yes, include setup instructions in README or separate docs.

---

## Next Steps

1. **Review & Approve:** Review this proposal and answer clarifying questions
2. **Create Branch:** Already created `feature/participant-code-key-lookup`
3. **Implement Phase 1:** Build server infrastructure
4. **Implement Phase 2:** Integrate client-side changes
5. **Test:** Comprehensive testing with `vercel dev` and production
6. **Deploy:** Merge to main and deploy to Vercel

---

## Risk Assessment

### Low Risk
- Cookie signing/verification (standard practice)
- localStorage updates (well-tested pattern)
- API route creation (Vercel standard)

### Medium Risk
- Special character handling in codes
- Cookie expiration timing
- Rate limiting implementation (edge cases)

### Mitigation
- Implement comprehensive error handling
- Test with various code formats
- Monitor production logs for edge cases

---

## Estimated Complexity

- **Server Routes:** Medium (3 endpoints, cookie management)
- **Client Integration:** Medium (state management, API calls)
- **Security:** Medium-High (cookie security, no key leakage)
- **Testing:** Medium (multiple scenarios, edge cases)

**Estimated Development Time:** 4-6 hours for full implementation + testing

---

## Conclusion

This proposal provides a secure, scalable solution for participant code validation and API key distribution. The architecture maintains separation between client and server, ensures no sensitive data leaks, and provides a smooth user experience while preserving existing functionality.

Ready for review and implementation upon approval.

