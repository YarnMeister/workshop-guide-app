// Database service for property insights API calls

export interface PropertySalesData {
  financial_year: number;
  active_month: string;
  listing_instance_id_hash: string;
  agency_id_hash: string;
  channel: string;
  property_type: string;
  property_type_group: string;
  state: string;
  suburb: string;
  postcode: string;
  state_suburb_postcode: string;
  price_search: number;
  price_search_sold: number;
  bedrooms: number;
  bedrooms_group: string;
  bathrooms: number;
  is_new_construction: boolean;
  sale_type: string;
}

export interface PriceInsight {
  suburb: string;
  avg_price: number;
  median_price: number;
  total_sales: number;
  price_change_pct?: number;
}

export interface PropertyTypeInsight {
  property_type: string;
  avg_price: number;
  total_sales: number;
  market_share_pct: number;
}

export interface TimeSeriesInsight {
  month: string;
  avg_price: number;
  total_sales: number;
  property_type?: string;
}

export interface SaleTypeInsight {
  sale_type: string;
  avg_price: number;
  total_sales: number;
  avg_premium_pct: number; // difference between asking and sold price
}

/**
 * Get property insights by suburb
 */
export async function getSuburbInsights(
  state?: string,
  limit = 20
): Promise<PriceInsight[]> {
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    params.append('limit', limit.toString());

    const response = await fetch(`/api/insights/suburbs?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch suburb insights:', error);
    throw error;
  }
}

/**
 * Get property type insights
 */
export async function getPropertyTypeInsights(
  state?: string
): Promise<PropertyTypeInsight[]> {
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);

    const response = await fetch(`/api/insights/property-types?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch property type insights:', error);
    throw error;
  }
}

/**
 * Get time series data for price trends
 */
export async function getPriceTrends(
  state?: string,
  propertyType?: string,
  months = 12
): Promise<TimeSeriesInsight[]> {
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (propertyType) params.append('property_type', propertyType);
    params.append('months', months.toString());

    const response = await fetch(`/api/insights/price-trends?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch price trends:', error);
    throw error;
  }
}

/**
 * Get sale type performance insights
 */
export async function getSaleTypeInsights(
  state?: string
): Promise<SaleTypeInsight[]> {
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);

    const response = await fetch(`/api/insights/sale-types?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sale type insights:', error);
    throw error;
  }
}

/**
 * Get overall market statistics
 */
export async function getMarketStats(state?: string): Promise<{
  total_sales: number;
  avg_price: number;
  median_price: number;
  total_suburbs: number;
  price_range: { min: number; max: number };
  most_active_month: string;
}> {
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);

    const response = await fetch(`/api/insights/market-stats?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch market stats:', error);
    throw error;
  }
}

/**
 * Search properties with filters
 */
export async function searchProperties(filters: {
  state?: string;
  suburb?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  sale_type?: string;
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<{
  data: PropertySalesData[];
  total: number;
  limit: number;
  offset: number;
}> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/properties/search?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to search properties:', error);
    throw error;
  }
}
