# Local Development Setup

## Prerequisites

You need the Vercel CLI to run API routes locally.

## Installation Steps

### 1. Install Vercel CLI globally

```bash
npm install -g vercel
```

### 2. Create `.env.local` file in project root

Create a file named `.env.local` in the root directory with:

```bash
# Cookie signing secret (generate with: openssl rand -hex 32)
COOKIE_SECRET=your-secret-here

# Participants JSON (single-line JSON string)
PARTICIPANTS_JSON={"test123":{"name":"Test User","apiKey":"sk-or-v1-test-key-here"}}
```

### 3. Generate COOKIE_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -hex 32
```

Copy the output and paste it as the value for `COOKIE_SECRET` in `.env.local`.

### 4. Add test participant data

Replace the `PARTICIPANTS_JSON` value with your actual participant codes and API keys:

```json
{
  "9fA#2": {
    "name": "Jane Doe",
    "apiKey": "sk-or-v1-actual-key-here"
  },
  "code2": {
    "name": "John Smith", 
    "apiKey": "sk-or-v1-another-key-here"
  }
}
```

**Important:** Keep this as a single line in the `.env.local` file!

### 5. Run the development server

```bash
npm run dev
```

This will start `vercel dev` which:
- Runs your Vite frontend
- Serves your API routes at `/api/*`
- Loads environment variables from `.env.local`

The app will be available at `http://localhost:3000` (or the port Vercel assigns).

## Troubleshooting

### "vercel: command not found"

Make sure Vercel CLI is installed globally:
```bash
npm install -g vercel
```

### API routes returning 404

Make sure you're running `npm run dev` (not `npm run dev:vite`). Only `vercel dev` can serve the API routes.

### COOKIE_SECRET not found

Make sure your `.env.local` file is in the project root directory (same level as `package.json`).

### Session errors

If you get cookie or session errors, make sure:
1. `COOKIE_SECRET` is set in `.env.local`
2. The secret is at least 32 characters
3. You're using `vercel dev` (not regular `vite`)

## Testing

Once running, you can test the API routes:

1. Open `http://localhost:3000`
2. Enter one of your test participant codes
3. You should be able to log in and see your personalized greeting

## Production Deployment

When ready to deploy to Vercel:

1. Set environment variables in Vercel dashboard:
   - `COOKIE_SECRET`
   - `PARTICIPANTS_JSON`

2. Deploy:
   ```bash
   vercel --prod
   ```

