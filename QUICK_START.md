# Quick Start Guide - Local Testing

## The Problem
You're accessing the app through `localhost:8082` (Vite), but API routes only work through `vercel dev` (typically port 3000).

## Solution

1. **Stop all dev servers:**
   ```bash
   pkill -f "vercel dev"
   pkill -f "vite"
   ```

2. **Start vercel dev:**
   ```bash
   npm run dev:vercel
   ```

3. **Wait for output like:**
   ```
   Ready! Available at http://localhost:3000
   ```

4. **IMPORTANT: Open your browser to:**
   ```
   http://localhost:3000
   ```
   
   NOT `http://localhost:8082` or `http://localhost:8080`

5. **Test the API:**
   - Enter a code like `9fA#2` from your `.env.local`
   - The API routes should work now!

## Why This Happens

- `vite` (port 8082) = Frontend only, no API routes
- `vercel dev` (port 3000) = Frontend + API routes + environment variables

Always use `vercel dev` when testing API routes locally!