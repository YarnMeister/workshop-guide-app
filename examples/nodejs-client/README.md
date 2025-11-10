# Workshop API Client - Node.js Example

This example demonstrates how to access the Workshop Guide App API from external Node.js applications.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
WORKSHOP_API_KEY=sk-or-v1-your-actual-api-key-here
WORKSHOP_API_BASE_URL=https://your-app.vercel.app
```

**How to get your API key:**
1. Log in to the Workshop Guide App with your participant code
2. Navigate to Step 1 of the onboarding
3. Click "Reveal API Key" to view your full key
4. Copy and paste it into your `.env` file

### 3. Run the Example

```bash
npm start
```

This will run all example API calls and display the results.

## What This Example Does

The example script demonstrates:

1. **Suburb Insights** - Fetches top 10 suburbs in Victoria with price data
2. **Market Statistics** - Gets overall market stats for Victoria
3. **Property Type Insights** - Retrieves insights by property type
4. **Property Search** - Searches for 3-bedroom properties in Melbourne

## Using in Your Own Project

### Import as a Module

```javascript
import {
  getSuburbInsights,
  getMarketStats,
  searchProperties
} from './workshop-api-client.js';

// Use the functions
const suburbs = await getSuburbInsights('VIC', 10);
const stats = await getMarketStats('VIC');
```

### Available Functions

- `getSuburbInsights(state, limit)` - Get suburb-level price insights
- `getPropertyTypeInsights(state)` - Get property type insights
- `getPriceTrends(state, propertyType, months)` - Get time-series price trends
- `getSaleTypeInsights(state)` - Get sale type insights
- `getMarketStats(state)` - Get overall market statistics
- `searchProperties(filters)` - Search properties with filters

### Custom API Requests

```javascript
import { apiRequest } from './workshop-api-client.js';

// Make a custom API request
const data = await apiRequest('/api/insights/suburbs', {
  state: 'NSW',
  limit: 20
});
```

## Error Handling

The client handles common errors:

- **401 Unauthorized** - Invalid or missing API key
- **429 Rate Limit** - Too many requests (100/minute limit)
- **500 Server Error** - Internal server error

Example with error handling:

```javascript
try {
  const suburbs = await getSuburbInsights('VIC', 10);
  console.log('Success:', suburbs);
} catch (error) {
  if (error.message.includes('Rate limit')) {
    console.log('Rate limited - waiting 60 seconds...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    // Retry
  } else {
    console.error('Error:', error.message);
  }
}
```

## Rate Limiting

- **Limit:** 100 requests per minute per participant
- **Scope:** Per API key
- **Reset:** Every 60 seconds

**Best practices:**
- Cache responses when possible
- Implement exponential backoff on 429 errors
- Batch requests efficiently

## Integration with AI Code Assistants

When asking an AI assistant to integrate this API:

### Example Prompt

```
I want to integrate the Workshop Guide App API into my project.

Setup:
1. Copy the files from examples/nodejs-client/ to my project
2. Install dependencies: npm install node-fetch dotenv
3. Create .env file with my API key: WORKSHOP_API_KEY=sk-or-v1-...
4. Add .env to .gitignore

Usage:
- Import functions from workshop-api-client.js
- Use getSuburbInsights(), getMarketStats(), etc.
- Handle rate limiting (100 req/min)
- Implement error handling for 401 and 429 errors

Example code:
[paste example from this README]
```

### Key Points for AI Assistants

1. **Authentication:** Always use `Authorization: Bearer <api-key>` header
2. **Rate Limiting:** 100 requests/minute - implement retry logic
3. **Error Handling:** Check for 401 (auth) and 429 (rate limit) errors
4. **Environment Variables:** Store API key in `.env`, never commit it
5. **HTTPS Only:** Use https:// in production (API keys in headers)

## TypeScript Support

To use with TypeScript, create type definitions:

```typescript
// types.ts
export interface SuburbInsight {
  suburb: string;
  avg_price: number;
  median_price: number;
  total_sales: number;
}

export interface MarketStats {
  total_sales: number;
  avg_price: number;
  median_price: number;
  total_suburbs: number;
  price_range: { min: number; max: number };
  most_active_month: string;
}

// workshop-api-client.ts
import type { SuburbInsight, MarketStats } from './types';

export async function getSuburbInsights(
  state: string | null = null,
  limit: number = 20
): Promise<SuburbInsight[]> {
  // ... implementation
}
```

## Troubleshooting

### "Authentication failed"
- Check that your API key is correct in `.env`
- Ensure the key starts with `sk-or-v1-`
- Verify you're a registered participant

### "Rate limit exceeded"
- You've made more than 100 requests in the last minute
- Wait 60 seconds and try again
- Implement request throttling in your code

### "Connection refused"
- Check that `WORKSHOP_API_BASE_URL` is correct
- Verify the API is running (production or local dev)
- Check your internet connection

## Further Documentation

- [Main API Documentation](../../EXTERNAL_API_ACCESS.md) - Complete API reference
- [Workshop Guide App README](../../README.md) - Project overview

## Support

For issues or questions:
- Review error messages (they include helpful details)
- Check the main API documentation
- Verify your API key is valid and active
- Ensure you're within rate limits

---

**Last Updated:** 2025-11-08

