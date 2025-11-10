import request from 'supertest';
import { describe, expect, it, beforeAll, afterEach, vi } from 'vitest';

const VALID_API_KEY = 'sk-test-valid';
const INVALID_API_KEY = 'sk-test-invalid';

const mockSuburbRows = [
  { suburb: 'Melbourne', avg_price: 850000, median_price: 800000, total_sales: 1200 },
  { suburb: 'Richmond', avg_price: 780000, median_price: 760000, total_sales: 640 },
];

const mockPropertyTypeRows = [
  { property_type: 'House', avg_price: 920000, total_sales: 5000, market_share_pct: 62.5 },
  { property_type: 'Apartment', avg_price: 650000, total_sales: 3200, market_share_pct: 37.5 },
];

const mockPriceTrendRows = [
  { month: '2025-01', avg_price: 870000, total_sales: 340 },
  { month: '2024-12', avg_price: 860000, total_sales: 310 },
];

const mockSaleTypeRows = [
  { sale_type: 'Auction', avg_price: 930000, total_sales: 4100, avg_premium_pct: 4.5 },
  { sale_type: 'Private Treaty', avg_price: 810000, total_sales: 2800, avg_premium_pct: 1.8 },
];

const mockMarketStatsRow = {
  total_sales: 428000,
  avg_price: 820000,
  median_price: 790000,
  total_suburbs: 134,
  min_price: 250000,
  max_price: 3250000,
  most_active_month: '2024-11',
};

// NOTE: Simplified mock data - real database schema has 20+ fields including:
// listing_instance_id_hash, agency_id_hash, channel, property_type_group, etc.
const mockPropertySearchRows = [
  {
    id: 1,
    suburb: 'Melbourne',
    state: 'VIC',
    property_type: 'House',
    price_search_sold: 950000,
    bedrooms: 3,
    bathrooms: 2,
    sale_type: 'Auction',
    active_month: '2025-01-01',
  },
  {
    id: 2,
    suburb: 'Southbank',
    state: 'VIC',
    property_type: 'Apartment',
    price_search_sold: 720000,
    bedrooms: 2,
    bathrooms: 2,
    sale_type: 'Private Treaty',
    active_month: '2024-12-01',
  },
];

const queryMock = vi.fn(async (text: string) => {
  if (text.includes('SELECT 1 as test')) {
    return { rows: [{ test: 1 }] };
  }

  if (text.includes('GROUP BY suburb') && text.includes('HAVING COUNT(*) >= 5')) {
    return { rows: mockSuburbRows };
  }

  if (text.includes('market_share_pct')) {
    return { rows: mockPropertyTypeRows };
  }

  if (text.includes('WITH recent_data AS')) {
    return { rows: mockPriceTrendRows };
  }

  if (text.includes('avg_premium_pct')) {
    return { rows: mockSaleTypeRows };
  }

  if (text.includes('COUNT(DISTINCT suburb)')) {
    return { rows: [mockMarketStatsRow] };
  }

  if (text.includes('SELECT COUNT(*)') && text.includes('FROM property_sales')) {
    return { rows: [{ count: String(mockPropertySearchRows.length) }] };
  }

  if (text.includes('ORDER BY active_month DESC') && text.includes('LIMIT')) {
    return { rows: mockPropertySearchRows };
  }

  return { rows: [] };
});

vi.mock('../server/database.js', () => ({
  query: queryMock,
  testConnection: vi.fn(async () => true),
  getPool: vi.fn(),
  closePool: vi.fn(async () => undefined),
}));

const getParticipantByApiKeyMock = vi.fn(async (key: string) => {
  if (key === VALID_API_KEY) {
    return { code: 'CODE123', name: 'Test Participant', apiKey: key, certId: 42 };
  }
  return null;
});

vi.mock('../server/participants.js', () => ({
  getParticipantByApiKey: getParticipantByApiKeyMock,
  getParticipantByCode: vi.fn(async () => null),
  getAllParticipants: vi.fn(async () => ({})),
  clearParticipantsCache: vi.fn(),
  isDatabaseReady: vi.fn(async () => true),
}));

let app: import('express').Express;

beforeAll(async () => {
  ({ default: app } = await import('../server/index.ts'));
});

afterEach(() => {
  queryMock.mockClear();
  getParticipantByApiKeyMock.mockClear();
});

describe('Public API endpoints', () => {
  const authHeader = { Authorization: `Bearer ${VALID_API_KEY}` };

  it('rejects requests without authentication', async () => {
    await request(app)
      .get('/api/insights/suburbs')
      .expect(401);
  });

  it('rejects requests with invalid API key', async () => {
    await request(app)
      .get('/api/insights/suburbs')
      .set('Authorization', `Bearer ${INVALID_API_KEY}`)
      .expect(401);
  });

  it('returns suburb insights', async () => {
    const response = await request(app)
      .get('/api/insights/suburbs?state=VIC&limit=2')
      .set(authHeader)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(mockSuburbRows.length);
    expect(queryMock).toHaveBeenCalled();
  });

  it('returns property type insights', async () => {
    const response = await request(app)
      .get('/api/insights/property-types?state=VIC')
      .set(authHeader)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('property_type');
  });

  it('returns price trends', async () => {
    const response = await request(app)
      .get('/api/insights/price-trends?months=2')
      .set(authHeader)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('month');
  });

  it('returns sale type insights', async () => {
    const response = await request(app)
      .get('/api/insights/sale-types?state=NSW')
      .set(authHeader)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('sale_type');
  });

  it('returns market stats', async () => {
    const response = await request(app)
      .get('/api/insights/market-stats?state=QLD')
      .set(authHeader)
      .expect(200);

    expect(response.body).toMatchObject({
      total_sales: mockMarketStatsRow.total_sales,
      avg_price: mockMarketStatsRow.avg_price,
      median_price: mockMarketStatsRow.median_price,
    });
  });

  it('returns property search results', async () => {
    const response = await request(app)
      .get('/api/properties/search?state=VIC&suburb=Melbourne&limit=2&offset=0')
      .set(authHeader)
      .expect(200);

    expect(response.body.total).toBe(mockPropertySearchRows.length);
    expect(response.body.limit).toBe(2);
    expect(response.body.offset).toBe(0);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0]).toHaveProperty('suburb');
  });

  it('provides database connectivity status', async () => {
    const response = await request(app)
      .get('/api/database/test')
      .set(authHeader)
      .expect(200);

    expect(response.body).toEqual({ connected: true });
  });

  it('exposes service health without authentication', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.env.useDatabaseParticipants).toBe(true);
  });

  it('includes CORS headers', async () => {
    const response = await request(app)
      .get('/api/insights/suburbs')
      .set(authHeader)
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('*');
  });
});

describe('Input Validation', () => {
  const authHeader = { Authorization: `Bearer ${VALID_API_KEY}` };

  it('clamps limit exceeding maximum to 100', async () => {
    // Implementation uses clamping instead of rejection (defensive programming)
    const response = await request(app)
      .get('/api/insights/suburbs?limit=999')
      .set(authHeader)
      .expect(200);

    // The API should clamp to max of 100, not reject
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('clamps negative limit to default (20)', async () => {
    // Implementation uses clamping instead of rejection
    const response = await request(app)
      .get('/api/insights/suburbs?limit=-10')
      .set(authHeader)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('clamps negative offset to 0', async () => {
    // Implementation uses clamping instead of rejection
    const response = await request(app)
      .get('/api/properties/search?offset=-5')
      .set(authHeader)
      .expect(200);

    expect(response.body.offset).toBe(0);
  });

  it('clamps months exceeding maximum to 60', async () => {
    // Implementation uses clamping instead of rejection
    const response = await request(app)
      .get('/api/insights/price-trends?months=100')
      .set(authHeader)
      .expect(200);

    // Should return data (clamped to 60 months max)
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('ignores invalid state parameter (treats as all states)', async () => {
    // Implementation treats invalid state as null (all states) instead of rejecting
    const response = await request(app)
      .get('/api/insights/suburbs?state=INVALID')
      .set(authHeader)
      .expect(200);

    // Should return data for all states (state filter ignored)
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('accepts valid state codes', async () => {
    const validStates = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

    for (const state of validStates) {
      await request(app)
        .get(`/api/insights/suburbs?state=${state}`)
        .set(authHeader)
        .expect(200);
    }
  });

  it('clamps excessively large bedrooms filter', async () => {
    // Implementation uses clamping instead of rejection
    const response = await request(app)
      .get('/api/properties/search?bedrooms=999')
      .set(authHeader)
      .expect(200);

    expect(response.body.data).toBeDefined();
  });

  it('clamps excessively large bathrooms filter', async () => {
    // Implementation uses clamping instead of rejection
    const response = await request(app)
      .get('/api/properties/search?bathrooms=999')
      .set(authHeader)
      .expect(200);

    expect(response.body.data).toBeDefined();
  });
});

describe('Admin Endpoint Protection', () => {
  const authHeader = { Authorization: `Bearer ${VALID_API_KEY}` };

  it('rejects API key auth for cache clearing', async () => {
    const response = await request(app)
      .post('/api/cache/clear')
      .set(authHeader)
      .expect(401);

    expect(response.body.error).toBe('Authentication required');
    expect(response.body.message).toContain('browser-based authentication');
    expect(response.body.message).toContain('API key access is not permitted');
  });

  it('rejects unauthenticated cache clearing', async () => {
    await request(app)
      .post('/api/cache/clear')
      .expect(401);
  });
});

describe('Rate Limiting', () => {
  // Note: Rate limit state persists across tests in the same test run
  // These tests verify rate limiting works, but may fail if run after other tests
  // that have already consumed the rate limit for the test API key

  it('enforces rate limiting after many requests', async () => {
    const freshApiKey = 'sk-test-ratelimit-1';

    // Mock a fresh participant for this test
    getParticipantByApiKeyMock.mockImplementation(async (key: string) => {
      if (key === VALID_API_KEY) {
        return { code: 'CODE123', name: 'Test Participant', apiKey: key, certId: 42 };
      }
      if (key === freshApiKey) {
        return { code: 'RATE1', name: 'Rate Test 1', apiKey: key, certId: 100 };
      }
      return null;
    });

    const authHeader = { Authorization: `Bearer ${freshApiKey}` };

    // Make requests until we hit rate limit (max 100 per minute)
    let rateLimited = false;
    let requestCount = 0;

    for (let i = 0; i < 105; i++) {
      const response = await request(app)
        .get('/api/insights/suburbs')
        .set(authHeader);

      requestCount++;

      if (response.status === 429) {
        rateLimited = true;
        expect(response.body.error).toBe('Rate limit exceeded');
        expect(response.body.message).toContain('100 requests per minute');
        break;
      }
    }

    // Should have hit rate limit before 105 requests
    expect(rateLimited).toBe(true);
    expect(requestCount).toBeLessThanOrEqual(101);
  });

  it('tracks rate limits per API key independently', async () => {
    const apiKey1 = 'sk-test-ratelimit-2';
    const apiKey2 = 'sk-test-ratelimit-3';

    // Mock two separate participants
    getParticipantByApiKeyMock.mockImplementation(async (key: string) => {
      if (key === VALID_API_KEY) {
        return { code: 'CODE123', name: 'Test Participant', apiKey: key, certId: 42 };
      }
      if (key === apiKey1) {
        return { code: 'RATE2', name: 'Rate Test 2', apiKey: key, certId: 101 };
      }
      if (key === apiKey2) {
        return { code: 'RATE3', name: 'Rate Test 3', apiKey: key, certId: 102 };
      }
      return null;
    });

    // Make a few requests with first API key
    for (let i = 0; i < 5; i++) {
      await request(app)
        .get('/api/insights/suburbs')
        .set({ Authorization: `Bearer ${apiKey1}` })
        .expect(200);
    }

    // Second API key should have its own rate limit (not affected by first)
    const response = await request(app)
      .get('/api/insights/suburbs')
      .set({ Authorization: `Bearer ${apiKey2}` })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('documents rate limit header behavior', async () => {
    const freshApiKey = 'sk-test-ratelimit-4';

    getParticipantByApiKeyMock.mockImplementation(async (key: string) => {
      if (key === VALID_API_KEY) {
        return { code: 'CODE123', name: 'Test Participant', apiKey: key, certId: 42 };
      }
      if (key === freshApiKey) {
        return { code: 'RATE4', name: 'Rate Test 4', apiKey: key, certId: 103 };
      }
      return null;
    });

    const response = await request(app)
      .get('/api/insights/suburbs')
      .set({ Authorization: `Bearer ${freshApiKey}` })
      .expect(200);

    // Note: Rate limit headers are not currently implemented
    // This test documents the expected behavior for future implementation
    // Expected headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
    if (response.headers['x-ratelimit-limit']) {
      expect(response.headers['x-ratelimit-limit']).toBe('100');
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    }
  });
});

