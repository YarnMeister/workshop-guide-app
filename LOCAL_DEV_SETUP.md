# Local Development Setup

## Running the App Locally

To test the API routes locally, you need to use `vercel dev` instead of `vite dev`:

```bash
npm run dev:vercel
```

OR run directly:

```bash
vercel dev
```

This will:
- Start Vite dev server for the frontend (via `vercel.json` config)
- Handle API routes in `/api` directory
- Read environment variables from `.env.local`

**Note:** The `devCommand` in `vercel.json` is set to `vite`, so `vercel dev` will automatically use Vite for the frontend.

## Environment Variables

Make sure your `.env.local` file contains:

```bash
PARTICIPANTS_JSON='{"code1":{"name":"Name","apiKey":"sk-or-v1-..."},"code2":...}'
COOKIE_SECRET=your-secret-key-here
```

**Important:** The `PARTICIPANTS_JSON` must be a single-line JSON string. If you have multiple participants, ensure the entire JSON is on one line.

## Troubleshooting

### API Routes Return 404

If you see 404 errors for `/api/*` routes:
1. Make sure you're using `npm run dev:vercel` or `vercel dev` directly
2. NOT `npm run dev` (which only runs Vite without API routes)

### Recursive Invocation Error

If you see "vercel dev must not recursively invoke itself":
- Don't set `dev` script in `package.json` to `vercel dev`
- Use `dev:vercel` script instead or run `vercel dev` directly
- The `devCommand` in `vercel.json` handles the frontend dev server

### Port Conflicts

If port 3000 is already in use, `vercel dev` will automatically use the next available port (3001, 3002, etc.).

### Environment Variables Not Loading

1. Check that `.env.local` exists in the project root
2. Restart `vercel dev` after changing `.env.local`
3. Verify variables with: `vercel env ls`

