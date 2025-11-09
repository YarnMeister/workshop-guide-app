# External API Access Guide

This guide explains how to access the Workshop Guide App API from external applications, scripts, and GitHub repositories.

## ⚠️ CRITICAL SECURITY WARNING

**NEVER commit API keys to version control!**

Your API key provides full access to your participant data. If exposed:
- ✅ **Immediately** rotate your key (contact workshop admin)
- ✅ **Remove** the key from any public repositories
- ✅ **Revoke** access if the key was shared

**Best Practices:**
- Store API keys in environment variables (`.env` files)
- Add `.env` to `.gitignore` before committing
- Use secret management tools in production (e.g., Vercel Environment Variables, AWS Secrets Manager)
- Never log API keys in application code
- Rotate keys regularly (every 90 days recommended)

---

## Table of Contents
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Available Endpoints](#available-endpoints)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Node.js Integration Example](#nodejs-integration-example)
- [Security Best Practices](#security-best-practices)

---

## Quick Start

### Prerequisites
1. You must be a registered workshop participant
2. You need your API key (retrieve it from the web app at `/onboarding/step/1`)

### Basic Usage
```bash
# Example: Fetch suburb insights
curl https://your-app.vercel.app/api/insights/suburbs?state=VIC \
  -H "Authorization: Bearer sk-or-v1-your-api-key-here"
```

---

## Authentication

The API supports **two authentication methods**:

### Method 1: Cookie-based (Web App Only)
- Used by the React frontend
- Session cookies are automatically managed by the browser
- **Not suitable for external clients**

### Method 2: API Key (External Clients) ✅
- Use this method for scripts, CLI tools, and external applications
- Send your API key in the `Authorization` header as a Bearer token

**Format:**
```
Authorization: Bearer <your-api-key>
```

**Example:**
```bash
curl https://your-app.vercel.app/api/insights/market-stats \
  -H "Authorization: Bearer sk-or-v1-abc123..."
```

### How to Get Your API Key
1. Log in to the web app with your participant code
2. Navigate to Step 1 of the onboarding
3. Click "Reveal API Key" to view your full key
4. Copy the key and store it securely (e.g., in environment variables)

---

## Available Endpoints

All endpoints require authentication. All endpoints are **read-only** (GET requests only).

### Base URL
```
Production: https://your-app.vercel.app
Local Dev:  http://localhost:3001
```

### Insights Endpoints

#### 1. Get Suburb Insights
```
GET /api/insights/suburbs
```

**Query Parameters:**
- `state` (optional): Filter by state (e.g., "VIC", "NSW", "QLD")
- `limit` (optional): Number of results (default: 20, max: 100)

**Response:**
```json
[
  {
    "suburb": "Melbourne",
    "avg_price": 850000,
    "median_price": 780000,
    "total_sales": 1234
  }
]
```

**Example:**
```bash
curl "https://your-app.vercel.app/api/insights/suburbs?state=VIC&limit=10" \
  -H "Authorization: Bearer sk-or-v1-..."
```

---

#### 2. Get Property Type Insights
```
GET /api/insights/property-types
```

**Query Parameters:**
- `state` (optional): Filter by state

**Response:**
```json
[
  {
    "property_type": "House",
    "avg_price": 920000,
    "median_price": 850000,
    "total_sales": 5678
  }
]
```

---

#### 3. Get Price Trends
```
GET /api/insights/price-trends
```

**Query Parameters:**
- `state` (optional): Filter by state
- `property_type` (optional): Filter by property type
- `months` (optional): Number of months to retrieve (default: 12)

**Response:**
```json
[
  {
    "month": "2024-01",
    "avg_price": 850000,
    "total_sales": 234
  }
]
```

---

#### 4. Get Sale Type Insights
```
GET /api/insights/sale-types
```

**Query Parameters:**
- `state` (optional): Filter by state

**Response:**
```json
[
  {
    "sale_type": "Auction",
    "avg_price": 920000,
    "total_sales": 3456,
    "avg_premium_pct": 5.2
  }
]
```

---

#### 5. Get Market Statistics
```
GET /api/insights/market-stats
```

**Query Parameters:**
- `state` (optional): Filter by state

**Response:**
```json
{
  "total_sales": 428000,
  "avg_price": 850000,
  "median_price": 780000,
  "total_suburbs": 1234,
  "price_range": { "min": 100000, "max": 5000000 },
  "most_active_month": "2024-03"
}
```

---

### Property Search Endpoint

#### Search Properties
```
GET /api/properties/search
```

**Query Parameters:**
- `state` (optional): Filter by state
- `suburb` (optional): Filter by suburb (partial match)
- `property_type` (optional): Filter by property type
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `bedrooms` (optional): Number of bedrooms
- `bathrooms` (optional): Number of bathrooms
- `sale_type` (optional): Sale type (e.g., "Auction", "Private Treaty")
- `year` (optional): Financial year
- `limit` (optional): Results per page (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "financial_year": 2024,
      "active_month": "2024-03-15",
      "state": "VIC",
      "suburb": "Melbourne",
      "property_type": "House",
      "price_search_sold": 850000,
      "bedrooms": 3,
      "bathrooms": 2,
      "sale_type": "Auction"
    }
  ],
  "total": 1234,
  "limit": 50,
  "offset": 0
}
```

---

## Rate Limiting

### Limits

**API Key Authentication:**
- **Limit:** 100 requests per minute per participant
- **Window:** Fixed 60-second window
- **Scope:** Per API key (tracked by participant code)

**Cookie Authentication (Web App):**
- **No rate limiting** - unlimited requests for browser-based access

### How It Works

The rate limiting uses a **fixed window** approach:

1. **First Request:** Creates a new 60-second window starting now
2. **Subsequent Requests:** Increment counter within the current window
3. **Window Expires:** After 60 seconds, counter resets to 0
4. **Limit Exceeded:** Returns 429 error until window expires

**Example Timeline:**
```
00:00 - Request 1-100 ✅ (allowed)
00:30 - Request 101   ❌ (rate limited, wait 30 seconds)
01:00 - Request 1     ✅ (new window, counter reset)
```

**Important:** The window does NOT slide. If you make 100 requests at 00:00, you must wait until 01:00 for the counter to reset, even if you stop making requests.

### Rate Limit Response

**HTTP Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 100 requests per minute. Please try again later.",
  "retryAfter": 60
}
```

**Response Headers:**
- `retryAfter`: Number of seconds to wait before retrying (always 60)

### Best Practices

1. **Implement Exponential Backoff:**
   ```javascript
   async function fetchWithRetry(url, options, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       const response = await fetch(url, options);

       if (response.status === 429) {
         const retryAfter = 60; // seconds
         const delay = retryAfter * 1000 * Math.pow(2, i); // Exponential backoff
         console.log(`Rate limited. Waiting ${delay}ms before retry ${i + 1}/${maxRetries}`);
         await new Promise(resolve => setTimeout(resolve, delay));
         continue;
       }

       return response;
     }
     throw new Error('Max retries exceeded');
   }
   ```

2. **Cache Responses Locally:**
   - Store frequently accessed data in memory or local storage
   - Respect cache TTL (5-10 minutes for insights data)
   - Reduces API calls and improves performance

3. **Batch Requests Efficiently:**
   - Combine multiple filters into single search query
   - Use pagination wisely (don't fetch all pages at once)
   - Schedule background jobs during off-peak hours

4. **Monitor Your Usage:**
   - Track request count in your application
   - Implement client-side throttling (e.g., max 90 req/min)
   - Log rate limit errors for debugging

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized (Invalid API Key)
```json
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid or has been deactivated."
}
```

#### 401 Unauthorized (Missing Authentication)
```json
{
  "error": "Authentication required",
  "message": "Please provide either a valid session cookie or API key in the Authorization header (Bearer token)."
}
```

#### 429 Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 100 requests per minute. Please try again later.",
  "retryAfter": 60
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to fetch suburb insights"
}
```

---

## Node.js Integration Example

### Installation
```bash
npm install node-fetch dotenv
```

### Environment Setup
Create a `.env` file:
```env
WORKSHOP_API_KEY=sk-or-v1-your-api-key-here
WORKSHOP_API_BASE_URL=https://your-app.vercel.app
```

### Example Script
```javascript
// workshop-api-client.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.WORKSHOP_API_KEY;
const BASE_URL = process.env.WORKSHOP_API_BASE_URL || 'https://your-app.vercel.app';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/insights/suburbs')
 * @param {object} params - Query parameters
 * @returns {Promise<any>} - Response data
 */
async function apiRequest(endpoint, params = {}) {
  // Build query string
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error (${response.status}): ${error.message || error.error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error.message);
    throw error;
  }
}

// Example usage functions
async function getSuburbInsights(state = null, limit = 20) {
  const params = { limit };
  if (state) params.state = state;
  return apiRequest('/api/insights/suburbs', params);
}

async function getMarketStats(state = null) {
  const params = {};
  if (state) params.state = state;
  return apiRequest('/api/insights/market-stats', params);
}

async function searchProperties(filters = {}) {
  return apiRequest('/api/properties/search', filters);
}

// Example: Fetch and display suburb insights
async function main() {
  try {
    console.log('Fetching suburb insights for VIC...');
    const suburbs = await getSuburbInsights('VIC', 10);
    console.log(`Found ${suburbs.length} suburbs:`);
    suburbs.forEach(suburb => {
      console.log(`- ${suburb.suburb}: $${suburb.avg_price.toLocaleString()} avg, ${suburb.total_sales} sales`);
    });

    console.log('\nFetching market statistics...');
    const stats = await getMarketStats('VIC');
    console.log(`Total sales: ${stats.total_sales.toLocaleString()}`);
    console.log(`Average price: $${stats.avg_price.toLocaleString()}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main();
```

### Running the Script
```bash
node workshop-api-client.js
```

---

## Security Best Practices

### 🔴 CRITICAL: API Key Protection

**Your API key is as sensitive as a password. Treat it accordingly.**

#### What NOT to Do ❌
```javascript
// ❌ NEVER hardcode API keys in source code
const API_KEY = 'sk-or-v1-abc123...'; // WRONG!

// ❌ NEVER commit .env files to Git
git add .env  // WRONG!

// ❌ NEVER log API keys
console.log(`Using API key: ${apiKey}`); // WRONG!

// ❌ NEVER share API keys in chat/email
"Here's my API key: sk-or-v1-..." // WRONG!
```

#### What TO Do ✅
```javascript
// ✅ Use environment variables
const API_KEY = process.env.WORKSHOP_API_KEY;

// ✅ Add .env to .gitignore
echo ".env" >> .gitignore

// ✅ Mask API keys in logs
const masked = apiKey.substring(0, 10) + '...';
console.log(`Using API key: ${masked}`);

// ✅ Use secret management in production
// Vercel: Environment Variables
// AWS: Secrets Manager
// GitHub: Repository Secrets
```

#### If Your API Key is Exposed 🚨

1. **Immediately** contact workshop admin to rotate the key
2. **Remove** the key from any public repositories
3. **Revoke** access if the key was shared
4. **Update** all applications using the old key
5. **Review** access logs for unauthorized usage

---

### 1. Environment Variables

**Always store API keys in environment variables:**

```bash
# .env file (add to .gitignore!)
WORKSHOP_API_KEY=sk-or-v1-your-api-key-here
WORKSHOP_API_BASE_URL=https://your-app.vercel.app
```

```javascript
// Load from environment
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.WORKSHOP_API_KEY;
if (!API_KEY) {
  throw new Error('WORKSHOP_API_KEY environment variable is required');
}
```

**Production Deployment:**
- **Vercel:** Use Environment Variables in project settings
- **AWS:** Use AWS Secrets Manager or Parameter Store
- **GitHub Actions:** Use Repository Secrets
- **Docker:** Use Docker secrets or environment files

---

### 2. Use HTTPS Only

**Never send API keys over HTTP:**

```javascript
// ✅ CORRECT - HTTPS in production
const BASE_URL = 'https://your-app.vercel.app';

// ❌ WRONG - HTTP exposes API keys
const BASE_URL = 'http://your-app.vercel.app'; // NEVER DO THIS!
```

**Why HTTPS matters:**
- API keys are sent in `Authorization` header
- HTTP transmits headers in plain text
- Anyone on the network can intercept HTTP traffic
- HTTPS encrypts all traffic (including headers)

---

### 3. Implement Error Handling

**Handle all error cases gracefully:**

```javascript
async function safeApiCall(endpoint) {
  try {
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    // Handle rate limiting
    if (response.status === 429) {
      const data = await response.json();
      console.warn(`Rate limited. Retry after ${data.retryAfter}s`);
      // Implement exponential backoff
      return null;
    }

    // Handle authentication errors
    if (response.status === 401) {
      console.error('Invalid API key. Check your credentials.');
      throw new Error('Authentication failed');
    }

    // Handle server errors
    if (response.status >= 500) {
      console.error('Server error. Try again later.');
      throw new Error('Server error');
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error.message);
    throw error;
  }
}
```

---

### 4. Cache Responses

**Reduce API calls by caching responses:**

```javascript
const cache = new Map();

async function getCachedData(key, fetchFn, ttlSeconds = 300) {
  const now = Date.now();
  const cached = cache.get(key);

  // Return cached data if valid
  if (cached && cached.expires > now) {
    console.log(`Cache hit: ${key}`);
    return cached.data;
  }

  // Fetch fresh data
  console.log(`Cache miss: ${key}`);
  const data = await fetchFn();

  // Store in cache
  cache.set(key, {
    data,
    expires: now + (ttlSeconds * 1000)
  });

  return data;
}

// Usage
const suburbs = await getCachedData(
  'suburbs-vic',
  () => getSuburbInsights('VIC', 10),
  300 // 5 minutes
);
```

---

### 5. Monitor Usage

**Track your API usage to avoid rate limits:**

```javascript
class RateLimitTracker {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Remove expired requests
    this.requests = this.requests.filter(
      time => time > now - this.windowMs
    );

    return this.requests.length < this.maxRequests;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }

  getUsage() {
    const now = Date.now();
    const activeRequests = this.requests.filter(
      time => time > now - this.windowMs
    );
    return {
      used: activeRequests.length,
      remaining: this.maxRequests - activeRequests.length,
      limit: this.maxRequests
    };
  }
}

// Usage
const tracker = new RateLimitTracker();

async function makeApiCall(endpoint) {
  if (!tracker.canMakeRequest()) {
    const usage = tracker.getUsage();
    console.warn(`Rate limit approaching: ${usage.used}/${usage.limit}`);
    await new Promise(resolve => setTimeout(resolve, 60000));
  }

  tracker.recordRequest();
  return await fetch(endpoint);
}
```

---

### 6. Rotate Keys Regularly

**Best practice: Rotate API keys every 90 days**

1. Generate new API key (contact workshop admin)
2. Update environment variables in all deployments
3. Test with new key
4. Revoke old key
5. Monitor for any issues

---

### 7. Never Log Sensitive Data

**Mask API keys in all log statements:**

```javascript
function maskApiKey(key) {
  if (!key || key.length < 10) return '***';
  return key.substring(0, 10) + '...';
}

// ✅ CORRECT - Masked logging
console.log(`API Key: ${maskApiKey(API_KEY)}`);

// ❌ WRONG - Full key in logs
console.log(`API Key: ${API_KEY}`); // NEVER DO THIS!
```

---

## AI Code Assistant Instructions

When integrating this API into a new project:

1. **Install dependencies:**
   ```bash
   npm install node-fetch dotenv
   ```

2. **Create `.env` file:**
   ```env
   WORKSHOP_API_KEY=<participant-api-key>
   WORKSHOP_API_BASE_URL=https://your-app.vercel.app
   ```

3. **Add to `.gitignore`:**
   ```
   .env
   .env.local
   ```

4. **Use the example client code** provided in this document

5. **Key implementation points:**
   - Always send `Authorization: Bearer <api-key>` header
   - Handle 429 rate limit errors with retry logic
   - Implement exponential backoff for failed requests
   - Cache responses when appropriate
   - Use TypeScript for type safety (optional but recommended)

6. **Testing:**
   - Test with a simple endpoint first (e.g., `/api/insights/market-stats`)
   - Verify authentication works before building complex logic
   - Test rate limiting behavior

---

## Support

For issues or questions:
- Check the main README.md for general documentation
- Review error messages carefully (they include helpful details)
- Ensure your API key is valid and active
- Verify you're within rate limits (100 req/min)

---

**Last Updated:** 2025-11-08
**API Version:** 1.0

