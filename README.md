# REA Vibe Coding Workshop

## Overview
Interactive onboarding instructions for participants of the PropTech Conference on 13 November 2025. This workshop guide app provides step-by-step instructions for setting up development tools and building applications.

## Vibe Coding Cheat Sheet

### At the start of each session:
- **In AI chat window type:** "Get the latest code from main branch at @https://github.com/YarnMeister/workshop-guide-app"
- **In AI chat window type:** "Start a new feature branch for (insert short description)"
- **Make changes as needed** by asking AI assistant to update the app in multiple chat requests

### Once changes are made and app looks the way you want it:
- **In terminal window type:** `npm run dev` (this starts the app with latest changes)
- **Copy paste the URL** in the terminal into your browser to test the app

### Ready to "go live":
- **In AI chat window type:** "Merge the current feature branch to main on remote and delete the feature branch once merged"
- **This copies the changes** you made back to GitHub so that others can see your awesome changes

## App Pages Overview

The workshop guide consists of 8 onboarding steps plus Welcome and Dashboard pages:

1. **Welcome** (`/`) - Participant code entry and authentication
2. **Setup Tools** (`/onboarding/step/1`) - Install Git, Node.js, Void Editor, configure GitHub
3. **Define the App Vision** (`/onboarding/step/2`) - Fill out PRD form with accordion sections
4. **Generate the Prototype** (`/onboarding/step/3`) - AI-enhanced prompt for Lovable
5. **Export to GitHub** (`/onboarding/step/4`) - Instructions for exporting from Lovable
6. **Learn the Vibe Coding Flow** (`/onboarding/step/5`) - Concepts, glossary, best practices
7. **Make Your First Commit** (`/onboarding/step/6`) - Git workflow with Void Editor
8. **Extend Your App** (`/onboarding/step/7`) - Placeholder for advanced features
9. **Launch to the Web** (`/onboarding/step/8`) - Deploy to Vercel
10. **Dashboard** (`/dashboard`) - Completion confirmation and next steps

## Technical Stack

### Frontend
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router v6
- **State Management**: React hooks + localStorage + TanStack Query
- **Styling**: Tailwind CSS + tailwindcss-animate
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: react-hook-form + zod validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (unified across local and production)
- **Database**: Neon Postgres (serverless PostgreSQL)
- **Database Client**: pg (node-postgres) with connection pooling
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit with automated migration generation and safety checks
- **Session Management**: Cookie-based with HMAC signing (HttpOnly, 8-hour expiration)
- **External APIs**: OpenRouter API (Claude 3.5 Sonnet for AI enhancement)

### Unified Backend Architecture
The app uses a **single Express.js application** that runs identically in both local development and production:

- **Local Development**: Express server runs on port 3001, proxied by Vite dev server on port 8080
- **Production (Vercel)**: Same Express app runs as a serverless function via `api/index.ts`
- **Key Benefit**: Identical behavior in both environments - no dual architecture complexity

**How it works:**
1. `server/index.ts` - Main Express application with all routes and middleware
2. `api/index.ts` - Thin wrapper that imports and exports the Express app for Vercel
3. In local dev: `server/index.ts` starts HTTP server on port 3001
4. In production: Vercel invokes the exported app from `api/index.ts`
5. Same database connection pooling, same routes, same logic everywhere

## Development

### Prerequisites
- Node.js (LTS version)
- npm or yarn

### Getting Started
```bash
# Clone the repository
git clone https://github.com/YarnMeister/workshop-guide-app.git

# Navigate to project directory
cd workshop-guide-app

# Install dependencies
npm install

# Start development server (runs both client and server)
npm run dev

# Or run separately:
npm run dev:client  # Vite dev server on port 8080
npm run dev:server  # Express server on port 3001
```

### Environment Setup

Create a `.env.local` file in the root directory (see `.env.example` for template):

```env
# OpenRouter API Key (for AI enhancement features)
VITE_OPEN_ROUTER_API_KEY=sk-or-v1-your-key-here

# Required for participant authentication
COOKIE_SECRET=your-secret-key-here-min-32-chars

# Participant data (JSON string format)
PARTICIPANTS_JSON={"CODE1":{"name":"Participant Name","apiKey":"sk-or-v1-..."},"CODE2":{...}}

# Neon Database URL (PostgreSQL connection string)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# CORS origin (optional, defaults to *)
ALLOWED_ORIGIN=http://localhost:8080

# Node environment
NODE_ENV=development
```

**Important Notes:**
- `COOKIE_SECRET` must be at least 32 characters for security
- `PARTICIPANTS_JSON` must be a valid JSON string (can contain special characters like `#`)
- `DATABASE_URL` must be a valid PostgreSQL connection string (Neon provides this)
- For production, set these in Vercel environment variables

### Project Structure
```
workshop-guide-app/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Header.tsx       # App header with participant name
│   │   ├── Breadcrumb.tsx   # Progress sidebar navigation
│   │   ├── PRDForm.tsx      # PRD form component (accordion)
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── pages/               # Route pages
│   │   ├── Welcome.tsx      # Landing page with code entry
│   │   ├── OnboardingStep.tsx # Main step page (handles all 8 steps)
│   │   ├── Dashboard.tsx    # Completion page
│   │   └── NotFound.tsx     # 404 page
│   ├── hooks/               # Custom React hooks
│   │   ├── useParticipant.ts    # Participant state & session
│   │   └── useWorkshopProgress.ts # Progress tracking
│   ├── services/            # API clients
│   │   ├── participant.ts   # Participant API endpoints
│   │   └── openrouter.ts    # AI enhancement service
│   ├── data/                # Static data
│   │   └── steps.ts         # Step definitions & content
│   ├── utils/               # Utilities
│   │   ├── storage.ts        # localStorage helpers
│   │   └── prdFormatter.ts  # PRD formatting for AI
│   └── App.tsx              # Root component with routing
├── server/                  # Express server (local dev)
│   ├── index.ts             # API routes & session management
│   └── database.ts          # Database connection & query helpers
├── api/                     # Vercel serverless functions
│   └── index.ts             # Entry point for production
├── drizzle/                 # Database schema & migrations
│   ├── schema.ts            # TypeScript schema definitions
│   └── migrations/          # Generated SQL migration files
├── scripts/                 # Build & migration scripts
│   ├── lint-migrations.cjs  # Migration safety checks
│   └── prebuild-migrations.cjs # Auto-run migrations on deploy
├── public/                  # Static assets (images, favicon)
├── drizzle.config.ts        # Drizzle ORM configuration
└── vercel.json              # Vercel deployment configuration
```

## Features

### Core Functionality
- **Participant Authentication**: Code-based entry with session management
- **Step-by-step guidance**: Clear instructions for each workshop phase
- **Progress tracking**: Persistent localStorage with binary sliders for step completion
- **PRD Form**: Accordion-based form with 9 sections for app vision definition
- **AI Enhancement**: Transforms PRD into optimized Lovable prompts via OpenRouter API
- **Copy-to-clipboard**: Easy command copying for terminal instructions
- **Responsive design**: Works on desktop and mobile devices
- **Interactive navigation**: Breadcrumb sidebar with progress indicators
- **Validation**: Next button disabled until all steps are completed (Step 1)
- **Visual feedback**: Progress summary, completion indicators, toast notifications
- **Session persistence**: Auto-resume from last step on return visit

### Technical Features
- **Dual backend**: Express for local dev, Vercel serverless for production
- **Secure sessions**: HMAC-signed cookies with HttpOnly flag
- **API key masking**: Secure display of participant API keys
- **Error handling**: Error boundaries, toast notifications, graceful fallbacks
- **Caching**: AI prompts cached in localStorage to avoid redundant API calls

## API Endpoints

### Backend Routes (`/api/*`)

- `POST /api/claim` - Claim participant code and create session
  - Body: `{ code: string }`
  - Returns: `{ success: boolean, participantId: string, name: string, apiKeyMasked: string }`
  
- `GET /api/session` - Check current session status
  - Returns: `{ authenticated: boolean, participantId?: string, name?: string }`
  
- `POST /api/reveal-key` - Reveal full API key (requires valid session)
  - Returns: `{ success: boolean, apiKey: string, apiKeyMasked: string }`
  
- `POST /api/logout` - Clear session cookie
  - Returns: `{ success: boolean }`
  
- `GET /api/health` - Health check endpoint
  - Returns: `{ status: string, env: object }`

### External APIs

- **OpenRouter API**: Used for AI prompt enhancement
  - Endpoint: `https://openrouter.ai/api/v1/chat/completions`
  - Model: `anthropic/claude-3.5-sonnet`
  - Called when transitioning from Step 2 to Step 3

## Database Management

### Schema & Migrations

The app uses **Drizzle ORM** for type-safe database schema definitions and automated migrations:

#### Schema Definition

Database schema is defined in TypeScript (`drizzle/schema.ts`):

```typescript
export const propertySales = pgTable('property_sales', {
  financialYear: integer('financial_year'),
  activeMonth: date('active_month'),
  state: char('state', { length: 3 }),
  suburb: varchar('suburb'),
  priceSearchSold: integer('price_search_sold'),
  // ... other columns
}, (table) => ({
  // Performance indexes for 400k+ rows
  stateIdx: index('property_sales_state_idx').on(table.state),
  suburbIdx: index('property_sales_suburb_idx').on(table.suburb),
  // ... composite indexes for common query patterns
}));
```

**Benefits:**
- Type-safe database queries
- Automatic TypeScript types from schema
- Version-controlled schema changes
- Performance indexes defined in code

#### Migration Commands

```bash
# Generate migration from schema changes
npm run db:generate

# Check migration status
npm run db:status

# Apply migrations to database
npm run db:migrate

# Lint migrations for safety
npm run db:lint:migrations
```

#### Migration Workflow

1. **Make Schema Changes**: Edit `drizzle/schema.ts`
2. **Generate Migration**: Run `npm run db:generate`
   - Creates SQL file in `drizzle/migrations/`
   - Generates metadata and snapshots
3. **Review Migration**: Check generated SQL for correctness
4. **Lint Migration**: Run `npm run db:lint:migrations`
   - Blocks destructive operations (DROP, TRUNCATE, DELETE)
   - Validates migration structure
5. **Apply Locally**: Run `npm run db:migrate`
   - Tests migration on local/dev database
6. **Commit Changes**: Commit schema + migration files to Git
7. **Deploy**: Push to main → Vercel auto-runs migrations in production

#### Migration Safety

The migration linter (`scripts/lint-migrations.cjs`) prevents common mistakes:

- ❌ **Blocks destructive operations** without explicit approval
- ❌ **Prevents manual transactions** (Drizzle handles this)
- ❌ **Detects empty migrations**
- ⚠️ **Warns about TODO/FIXME comments**

To allow destructive operations, add comment to migration:
```sql
-- allow-destructive
DROP TABLE old_table;
```

#### Automatic Migrations on Deploy

Migrations run automatically during Vercel production builds:

1. **Prebuild Hook**: `npm run prebuild` → `scripts/prebuild-migrations.cjs`
2. **Lint Migrations**: Validates all migration files
3. **Apply Migrations**: Runs pending migrations against production DB
4. **Build App**: Proceeds with Vite build if migrations succeed

**Environment Detection:**
- **Production**: Runs migrations automatically
- **Preview/Dev**: Skips migrations (run manually)

#### Performance Optimizations

The current schema includes **9 performance indexes** on the `property_sales` table (428k+ rows):

**Single-column indexes:**
- `state` - State filtering
- `suburb` - Suburb searches and GROUP BY
- `property_type` - Property type analysis
- `active_month` - Time-series queries
- `price_search_sold` - Price aggregations and sorting

**Composite indexes:**
- `(state, suburb)` - State + suburb filtering
- `(state, property_type)` - State + type analysis
- `(state, active_month)` - State + time-series
- `(state, price_search_sold)` - State + price queries

**Expected Performance:**
- Without indexes: 2-10 seconds per aggregation
- With indexes: 50-500ms per aggregation
- With caching: 1-10ms for cached results

### Query Caching

The API implements **in-memory caching** for read-heavy endpoints:

```typescript
// Cache configuration
const cache = new Map<string, CacheEntry>();

// Cached endpoints (5-10 minute TTL)
GET /api/insights/suburbs        // 5 min cache
GET /api/insights/property-types // 5 min cache
GET /api/insights/market-stats   // 10 min cache
```

**Benefits:**
- Reduces database load for 20 concurrent users
- Improves response times (1-10ms for cached data)
- Automatic cache expiration every 5 minutes
- Manual cache clearing via `POST /api/cache/clear`

### Connection Pooling

Database connections are optimized for **serverless environments**:

```typescript
// Serverless-optimized pool settings
max: 10,              // Reduced for serverless (Vercel runs multiple instances)
min: 0,               // Allow pool to scale to zero when idle
idleTimeoutMillis: 10000,  // Fast cleanup (10s)
allowExitOnIdle: true,     // Allows process to exit when idle
```

**Why these settings:**
- Vercel runs multiple serverless instances
- Each instance has its own connection pool
- Lower `max` prevents connection exhaustion
- `allowExitOnIdle` enables proper serverless shutdown

### Query Monitoring

Slow queries (>1 second) are automatically logged:

```typescript
⚠️  Slow query (1234ms): SELECT suburb, AVG(price_search_sold)...
```

This helps identify performance bottlenecks during development and production.

## Deployment

### Vercel Deployment

The app is configured for Vercel deployment:

1. **Build Configuration** (`vercel.json`):
   - Build command: `npm run build`
   - Output directory: `dist`
   - API routes: `/api/*` → serverless functions
   - Function memory: 1024MB
   - Function timeout: 10 seconds

2. **Environment Variables** (set in Vercel dashboard):
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `COOKIE_SECRET` - HMAC signing secret
   - `PARTICIPANTS_JSON` - Participant data JSON string
   - `ALLOWED_ORIGIN` - CORS origin (optional)
   - `NODE_ENV` - Set to `production`

3. **Deployment Process**:
   ```bash
   # Build locally to test
   npm run build
   
   # Deploy to Vercel
   vercel deploy
   # Or push to main branch (auto-deploys if connected)
   ```

## Contributing

1. Create a feature branch for your changes
2. Follow the established style guide for content
3. Test your changes locally with `npm run dev`
4. Ensure environment variables are configured
5. Test API endpoints locally before deploying
6. Merge to main when ready to deploy

## License

This project is part of the REA Vibe Coding Workshop for the PropTech Conference 2025.

## Style Guide

Based on the Setup Tools page implementation, here are the styling patterns for consistent content creation:

### H1 - Page Headings
```css
text-3xl font-bold tracking-tight sm:text-4xl
```
- **Usage**: Main page titles (e.g., "Setup Your Development Environment")
- **Size**: Large, bold, responsive
- **Example**: Page title at the top of each step

### H2 - Section Headings
```css
font-semibold text-lg
```
- **Usage**: Main section titles within steps (e.g., "Create Your Accounts")
- **Size**: Medium, semibold
- **Example**: Step titles like "Install Void Editor", "Connect Git to Your GitHub Account"

### H3 - Subsection Headings
```css
font-medium text-sm
```
- **Usage**: Subsection titles (e.g., "GitHub Account", "Set your name")
- **Size**: Small, medium weight
- **Example**: Individual instruction titles within sections

### Paragraph Text
```css
text-sm text-muted-foreground
```
- **Usage**: Instructions, descriptions, and explanatory text
- **Size**: Small, muted color
- **Example**: Step descriptions, instruction text, explanations

### Code Blocks
```css
overflow-x-auto rounded-md bg-muted p-4 text-sm
```
- **Usage**: Code snippets, commands, and technical content
- **Background**: Light grey (`bg-muted`)
- **Padding**: 4 units
- **Example**: Terminal commands, code examples, URLs

### Copyable Commands
```css
flex items-center justify-between rounded-md bg-muted p-3 text-sm
```
- **Usage**: Individual commands that can be copied to clipboard
- **Features**: Copy button, grey background, compact padding
- **Example**: `git config --global user.name "Your Name"`

## Architecture Overview

### State Management

The app uses a combination of React hooks and localStorage for state management:

1. **Participant State** (`useParticipant` hook):
   - Manages participant authentication
   - Handles session validation
   - Stores participant ID, name, and masked API key
   - API key stored in memory only (never persisted)

2. **Progress State** (`useWorkshopProgress` hook):
   - Tracks current step ID
   - Stores completed pages array
   - Manages setup page todos (Step 1)
   - Persists PRD answers
   - Stores template texts (write specs, prototype)
   - Handles AI enhancement errors

3. **Storage**:
   - `localStorage`: Stores `workshop_progress` object
   - Session cookies: `participant_session` (HttpOnly, signed, 8-hour expiration)

### Data Flow

1. **Participant Authentication**:
   ```
   User enters code → POST /api/claim → Validate code → 
   Create signed cookie → Return participant data → 
   Store in localStorage + React state
   ```

2. **Progress Tracking**:
   ```
   User actions → updateProgress() → Save to localStorage → 
   Update React state → Persist across sessions
   ```

3. **AI Enhancement** (Step 2 → Step 3):
   ```
   PRD form data → formatPRDForAI() → Check cache → 
   Call OpenRouter API → Transform to Lovable prompt → 
   Cache result → Display in Step 3
   ```

### Security Considerations

- **Session Management**: HMAC-signed cookies prevent tampering
- **API Key Security**: Full keys never persisted, only displayed on-demand
- **CORS**: Configurable origin restrictions
- **HttpOnly Cookies**: Prevents XSS attacks on session data
- **Secure Flag**: Enabled in production for HTTPS-only cookies

## Notable Implementation Details

These are key architectural decisions and patterns used throughout the application:

### 1. Dual Backend Architecture
The app uses Express.js for local development and Vercel serverless functions for production. The same Express app (`server/index.ts`) is imported by the Vercel function entry point (`api/index.ts`), ensuring consistent behavior across environments.

**Why**: Allows full Express features locally (hot reload, debugging) while leveraging Vercel's serverless infrastructure in production.

### 2. Session Persistence Strategy
The app maintains session state in two places: signed HTTP-only cookies (server-side) and localStorage (client-side). The `useParticipant` hook synchronizes these on mount, checking cookie validity before trusting localStorage data.

**Why**: Provides resilience - if cookies expire, localStorage can restore session; if localStorage is cleared, cookies can restore it. This dual-persistence prevents accidental logouts.

### 3. AI Prompt Caching
PRD content is hashed (using base64 encoding) and used as a cache key in localStorage. This prevents redundant API calls when users navigate back to Step 3 or re-enter the same PRD content.

**Why**: Reduces API costs, improves performance, and provides better UX (instant loading of previously generated prompts).

### 4. Migration Support
The storage utilities (`utils/storage.ts`) include migration logic to handle old localStorage formats. When loading progress, it checks for missing fields and initializes them with defaults.

**Why**: Allows seamless updates without breaking existing user sessions or requiring data migration scripts.

### 5. Progressive Enhancement
The app works without JavaScript for basic content display, though full interactivity requires JS. Error boundaries catch React errors gracefully, and API failures show user-friendly toast messages.

**Why**: Ensures the app remains functional even if JavaScript fails or APIs are unavailable, providing a better user experience.

### 6. Component Composition Pattern
The `OnboardingStep` component handles all 8 steps dynamically based on step data from `steps.ts`. This single component renders different content structures (sections, tabs, forms) based on step configuration.

**Why**: Reduces code duplication, makes adding new steps easier, and ensures consistent UI patterns across all steps.

### 7. API Key Reveal Flow
API keys are never stored in localStorage. When needed, the app calls `/api/reveal-key` which validates the session cookie before returning the full key. The key is stored in React state (memory only) for the session duration.

**Why**: Maximum security - even if localStorage is compromised, API keys aren't exposed. Keys are only revealed on-demand with valid authentication.

### 8. Link Rendering System
The app includes a custom `renderTextWithLinks` function that processes both markdown-style links `[text](url)` and plain URLs, converting them to clickable anchor tags with proper security attributes (`target="_blank"`, `rel="noopener noreferrer"`).

**Why**: Allows content creators to use natural markdown syntax while ensuring all external links open safely in new tabs.

### 9. Context Panel Detection
Step 5 includes special logic to distinguish "context panels" (informational content) from "workflow steps" (actionable instructions). Only workflow steps get numbered, while context panels are displayed without step numbers.

**Why**: Provides clearer visual hierarchy and prevents confusion about which items require action vs. which are informational.

### 10. Error State Persistence
When AI enhancement fails, the error message is stored in progress state and displayed when the user returns to Step 3. This allows users to see what went wrong even after navigating away.

**Why**: Improves debugging experience and helps users understand why their prompt wasn't enhanced, without losing their PRD content.
