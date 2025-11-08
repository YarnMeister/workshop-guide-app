# External API Access Guide

This guide explains how to access the Workshop Guide App API from external applications, scripts, and GitHub repositories.

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

**Limit:** 100 requests per minute per participant

**Behavior:**
- Rate limit is tracked per API key
- Resets every 60 seconds
- Cookie-based authentication (web app) is **not** rate limited

**Rate Limit Exceeded Response:**
```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 100 requests per minute. Please try again later.",
  "retryAfter": 60
}
```

**HTTP Status Code:** `429 Too Many Requests`

**Best Practices:**
- Implement exponential backoff when receiving 429 errors
- Cache responses locally when possible
- Batch requests efficiently

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

### 1. Protect Your API Key
- **Never commit API keys to version control**
- Store keys in environment variables or secure vaults
- Use `.env` files and add them to `.gitignore`

### 2. Use HTTPS Only
- Always use `https://` in production
- API keys are transmitted in headers (secure over HTTPS)

### 3. Implement Error Handling
- Handle rate limit errors gracefully (429)
- Implement retry logic with exponential backoff
- Log errors for debugging

### 4. Cache Responses
- Cache API responses locally when appropriate
- Respect cache headers if provided
- Reduces API calls and improves performance

### 5. Monitor Usage
- Track your API usage to stay within rate limits
- Implement request throttling in your application
- Use batch requests when possible

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

