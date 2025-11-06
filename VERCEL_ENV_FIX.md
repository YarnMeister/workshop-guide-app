# Fixing PARTICIPANTS_JSON in Vercel

## The Problem
Vercel environment variables with special characters (like `#`) need to be properly quoted, otherwise they get truncated.

## Solution: Quote the JSON Value

In Vercel's Environment Variables dashboard:

1. **Go to**: Your Project → Settings → Environment Variables
2. **Find**: `PARTICIPANTS_JSON`
3. **Wrap the entire JSON value in double quotes**:

Instead of:
```
PARTICIPANTS_JSON={"9fA#2":{"name":"Bill",...}}
```

Use:
```
PARTICIPANTS_JSON="{\"9fA#2\":{\"name\":\"Bill\",...}}"
```

Or use single quotes around the whole thing (easier):
```
PARTICIPANTS_JSON='{"9fA#2":{"name":"Bill",...}}'
```

## Steps to Fix

1. Copy your entire PARTICIPANTS_JSON value
2. Wrap it in single quotes: `'...your json...'`
3. Paste it into Vercel's environment variable field
4. Save
5. Redeploy (or wait for auto-deploy)

## Alternative: Base64 Encoding (if quoting doesn't work)

If quoting still doesn't work, we can encode the JSON as base64:

1. Encode your JSON:
   ```bash
   echo '{"9fA#2":{"name":"Bill",...}}' | base64
   ```

2. Set in Vercel:
   ```
   PARTICIPANTS_JSON_B64=<base64-encoded-value>
   ```

3. Then update the server code to decode it.

## Check Logs

After deploying, check Vercel Function Logs to see:
- `PARTICIPANTS_JSON length: X` - Should be ~2700+ characters
- `PARTICIPANTS_JSON first 50 chars:` - Should start with `{"`
- `PARTICIPANTS_JSON last 50 chars:` - Should end with `}`

If you see it's truncated (length < 100 or doesn't end with `}`), the environment variable needs to be quoted.
