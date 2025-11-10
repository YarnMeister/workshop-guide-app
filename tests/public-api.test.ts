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
});

