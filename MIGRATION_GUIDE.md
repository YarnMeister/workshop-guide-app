# Participant Data Migration Guide

## Overview

This guide documents the migration from environment variable-based participant storage (`PARTICIPANTS_JSON`) to a database-backed system using PostgreSQL.

## ✅ Migration Status

- **Schema Created**: ✅ `participants` table with indexes
- **Data Migrated**: ✅ 25 participants seeded into database
- **Code Updated**: ✅ Server endpoints use database with fallback
- **Security**: ✅ No secrets in git history or committed code

## Architecture Changes

### Before (Environment Variable)
```
.env.local → PARTICIPANTS_JSON → loadParticipants() → In-memory cache
```

### After (Database)
```
Database → getParticipantByCode() → In-memory cache (5 min TTL)
         ↓ (fallback if DB empty)
.env.local → PARTICIPANTS_JSON → loadParticipants()
```

## Database Schema

```sql
CREATE TABLE participants (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,      -- Participant code (e.g., "9fA#2")
  name VARCHAR(255) NOT NULL,             -- Participant name
  api_key VARCHAR(255) NOT NULL,          -- OpenRouter API key
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_participants_code ON participants(code);
CREATE INDEX idx_participants_active ON participants(is_active);
```

## Feature Flag

The migration includes a feature flag for safe rollback:

```typescript
// In server/index.ts
const USE_DATABASE_PARTICIPANTS = process.env.USE_DATABASE_PARTICIPANTS !== 'false';
```

**Default**: Database mode (true)
**Rollback**: Set `USE_DATABASE_PARTICIPANTS=false` in environment variables

## Local Development

### 1. Run Migrations

```bash
npm run db:migrate
```

This creates the `participants` table in your local database.

### 2. Seed Participants

```bash
npx tsx scripts/seed-participants.ts
```

This reads `PARTICIPANTS_JSON` from `.env.local` and populates the database.

**Security Note**: The seeding script is gitignored and only logs participant names (not codes or API keys).

### 3. Verify Migration

```bash
# Start the server
npm run dev

# Check health endpoint
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "env": {
    "hasCookieSecret": true,
    "hasParticipantsJson": true,
    "useDatabaseParticipants": true,
    "databaseReady": true
  }
}
```

## Production Deployment

### Option 1: Database Import (Recommended)

1. Export participants from local database:
   ```bash
   pg_dump --data-only --table=participants \
     -h localhost -U your_user -d your_db > participants.sql
   ```

2. Import to Neon via their console or CLI:
   ```bash
   psql $DATABASE_URL < participants.sql
   ```

3. Delete the export file immediately after import

### Option 2: Run Seeding Script on Production

1. Keep `PARTICIPANTS_JSON` in Vercel environment variables temporarily
2. SSH/connect to production environment
3. Run: `npx tsx scripts/seed-participants.ts`
4. Remove `PARTICIPANTS_JSON` from Vercel after verification

### Option 3: Manual Entry via Neon Console

1. Connect to Neon database console
2. Run INSERT statements manually (copy from local database)
3. Most secure but time-consuming for 25 participants

## Verification Steps

### 1. Test Authentication

```bash
# Test participant code claim
curl -X POST http://localhost:5000/api/claim \
  -H "Content-Type: application/json" \
  -d '{"code":"9fA#2"}' \
  -c cookies.txt

# Should return:
# {"success":true,"participantId":"9fA#2","name":"Bill","apiKeyMasked":"sk-or-v1********"}
```

### 2. Test Session Validation

```bash
curl http://localhost:5000/api/session -b cookies.txt

# Should return:
# {"authenticated":true,"participantId":"9fA#2","name":"Bill"}
```

### 3. Test API Key Reveal

```bash
curl -X POST http://localhost:5000/api/reveal-key -b cookies.txt

# Should return full API key
```

## Rollback Procedure

If issues occur, you can instantly rollback:

### Local Development
```bash
# Set environment variable
export USE_DATABASE_PARTICIPANTS=false

# Restart server
npm run dev
```

### Production (Vercel)
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add: `USE_DATABASE_PARTICIPANTS=false`
3. Redeploy or wait for automatic deployment

The system will immediately fall back to `PARTICIPANTS_JSON` environment variable.

## Security Considerations

### ✅ What's Protected

1. **Seeding script gitignored**: `scripts/seed-participants.ts` is in `.gitignore`
2. **No secrets in migrations**: Migration files contain only schema, no data
3. **No secrets in logs**: Only participant names are logged, not codes or API keys
4. **Parameterized queries**: All database queries use prepared statements
5. **Environment variables**: `.env.local` remains gitignored

### ⚠️ Important Notes

- **Never commit** the seeding script output
- **Never log** participant codes or API keys
- **Always use** parameterized queries for database operations
- **Keep** `.env.local` as backup during transition period
- **Remove** `PARTICIPANTS_JSON` from production env vars after successful migration

## Future Enhancements

Now that participants are in the database, you can easily add:

1. **Admin Dashboard**
   - Add/edit/deactivate participants via UI
   - View usage statistics per participant

2. **Usage Tracking**
   - Track API calls per participant
   - Monitor OpenRouter usage and costs

3. **Rate Limiting**
   - Implement per-participant rate limits
   - Prevent abuse

4. **Audit Logs**
   - Track when participants log in
   - Monitor API key reveals

5. **Email Notifications**
   - Send usage alerts
   - Notify of suspicious activity

6. **Soft Delete**
   - Deactivate participants without losing data
   - Reactivate if needed

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
curl http://localhost:5000/api/database/test

# Expected: {"connected":true}
```

### Participants Not Loading

```bash
# Check if database has participants
psql $DATABASE_URL -c "SELECT COUNT(*) FROM participants WHERE is_active = true;"

# Should return: 25
```

### Clear Cache

```bash
# Clear all caches (requires authentication)
curl -X POST http://localhost:5000/api/cache/clear \
  -b cookies.txt

# Expected: {"success":true,"message":"All caches cleared successfully"}
```

## Files Changed

- ✅ `drizzle/schema.ts` - Added participants table schema
- ✅ `drizzle/migrations/0001_*.sql` - Migration file (schema only)
- ✅ `server/participants.ts` - New participant service module
- ✅ `server/index.ts` - Updated to use database with fallback
- ✅ `scripts/seed-participants.ts` - Seeding script (gitignored)
- ✅ `.gitignore` - Added seeding scripts to ignore list

## Support

For issues or questions:
1. Check the health endpoint: `/api/health`
2. Review server logs for errors
3. Verify database connection: `/api/database/test`
4. Use rollback procedure if needed

