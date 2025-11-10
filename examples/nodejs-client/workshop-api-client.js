/**
 * Workshop Guide App - Node.js API Client Example
 * 
 * This example demonstrates how to access the Workshop Guide App API
 * from external Node.js applications, scripts, or GitHub repositories.
 * 
 * Prerequisites:
 * 1. Node.js installed (v18+ recommended)
 * 2. Workshop participant API key
 * 3. Dependencies: node-fetch, dotenv
 * 
 * Installation:
 *   npm install node-fetch dotenv
 * 
 * Usage:
 *   node workshop-api-client.js
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuration
const API_KEY = process.env.WORKSHOP_API_KEY;
const BASE_URL = process.env.WORKSHOP_API_BASE_URL || 'https://your-app.vercel.app';

// Validate configuration
if (!API_KEY) {
  console.error('❌ Error: WORKSHOP_API_KEY environment variable is not set');
  console.error('Please create a .env file with your API key:');
  console.error('  WORKSHOP_API_KEY=sk-or-v1-your-api-key-here');
  process.exit(1);
}

/**
 * Make an authenticated API request
 * 
 * @param {string} endpoint - API endpoint (e.g., '/api/insights/suburbs')
 * @param {object} params - Query parameters
 * @returns {Promise<any>} - Response data
 * @throws {Error} - If request fails
 */
async function apiRequest(endpoint, params = {}) {
  // Build query string from parameters
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  try {
    console.log(`📡 Requesting: ${endpoint}${queryString ? `?${queryString}` : ''}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const error = await response.json();
      console.error(`⚠️  Rate limit exceeded. Retry after ${error.retryAfter} seconds.`);
      throw new Error(`Rate limit exceeded: ${error.message}`);
    }

    // Handle authentication errors
    if (response.status === 401) {
      const error = await response.json();
      console.error('❌ Authentication failed:', error.message);
      throw new Error(`Authentication failed: ${error.message}`);
    }

    // Handle other errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error (${response.status}): ${error.message || error.error}`);
    }

    const data = await response.json();
    console.log(`✅ Success: Received ${Array.isArray(data) ? data.length : 1} result(s)`);
    return data;

  } catch (error) {
    console.error('❌ API Request Failed:', error.message);
    throw error;
  }
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Get suburb-level price insights
 * 
 * @param {string|null} state - Filter by state (e.g., 'VIC', 'NSW')
 * @param {number} limit - Number of results (default: 20)
 * @returns {Promise<Array>} - Array of suburb insights
 */
async function getSuburbInsights(state = null, limit = 20) {
  const params = { limit };
  if (state) params.state = state;
  return apiRequest('/api/insights/suburbs', params);
}

/**
 * Get property type insights
 * 
 * @param {string|null} state - Filter by state
 * @returns {Promise<Array>} - Array of property type insights
 */
async function getPropertyTypeInsights(state = null) {
  const params = {};
  if (state) params.state = state;
  return apiRequest('/api/insights/property-types', params);
}

/**
 * Get price trends over time
 * 
 * @param {string|null} state - Filter by state
 * @param {string|null} propertyType - Filter by property type
 * @param {number} months - Number of months to retrieve (default: 12)
 * @returns {Promise<Array>} - Array of time-series data
 */
async function getPriceTrends(state = null, propertyType = null, months = 12) {
  const params = { months };
  if (state) params.state = state;
  if (propertyType) params.property_type = propertyType;
  return apiRequest('/api/insights/price-trends', params);
}

/**
 * Get sale type insights
 * 
 * @param {string|null} state - Filter by state
 * @returns {Promise<Array>} - Array of sale type insights
 */
async function getSaleTypeInsights(state = null) {
  const params = {};
  if (state) params.state = state;
  return apiRequest('/api/insights/sale-types', params);
}

/**
 * Get overall market statistics
 * 
 * @param {string|null} state - Filter by state
 * @returns {Promise<object>} - Market statistics object
 */
async function getMarketStats(state = null) {
  const params = {};
  if (state) params.state = state;
  return apiRequest('/api/insights/market-stats', params);
}

/**
 * Search properties with filters
 * 
 * @param {object} filters - Search filters
 * @param {string} filters.state - Filter by state
 * @param {string} filters.suburb - Filter by suburb (partial match)
 * @param {string} filters.property_type - Filter by property type
 * @param {number} filters.min_price - Minimum price
 * @param {number} filters.max_price - Maximum price
 * @param {number} filters.bedrooms - Number of bedrooms
 * @param {number} filters.bathrooms - Number of bathrooms
 * @param {string} filters.sale_type - Sale type
 * @param {number} filters.year - Financial year
 * @param {number} filters.limit - Results per page (default: 50)
 * @param {number} filters.offset - Pagination offset (default: 0)
 * @returns {Promise<object>} - Search results with pagination
 */
async function searchProperties(filters = {}) {
  return apiRequest('/api/properties/search', filters);
}

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Main function - demonstrates various API calls
 */
async function main() {
  console.log('🚀 Workshop Guide App - API Client Example\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 20)}...\n`);

  try {
    // Example 1: Get suburb insights for Victoria
    console.log('\n📊 Example 1: Suburb Insights (VIC, Top 10)');
    console.log('─'.repeat(60));
    const suburbs = await getSuburbInsights('VIC', 10);
    console.log(`\nFound ${suburbs.length} suburbs:\n`);
    suburbs.forEach((suburb, index) => {
      console.log(`${index + 1}. ${suburb.suburb}`);
      console.log(`   Average Price: $${suburb.avg_price.toLocaleString()}`);
      console.log(`   Median Price:  $${suburb.median_price.toLocaleString()}`);
      console.log(`   Total Sales:   ${suburb.total_sales.toLocaleString()}`);
    });

    // Example 2: Get market statistics
    console.log('\n\n📈 Example 2: Market Statistics (VIC)');
    console.log('─'.repeat(60));
    const stats = await getMarketStats('VIC');
    console.log(`\nTotal Sales:      ${stats.total_sales.toLocaleString()}`);
    console.log(`Average Price:    $${stats.avg_price.toLocaleString()}`);
    console.log(`Median Price:     $${stats.median_price.toLocaleString()}`);
    console.log(`Total Suburbs:    ${stats.total_suburbs.toLocaleString()}`);
    console.log(`Price Range:      $${stats.price_range.min.toLocaleString()} - $${stats.price_range.max.toLocaleString()}`);
    console.log(`Most Active:      ${stats.most_active_month}`);

    // Example 3: Get property type insights
    console.log('\n\n🏠 Example 3: Property Type Insights (VIC)');
    console.log('─'.repeat(60));
    const propertyTypes = await getPropertyTypeInsights('VIC');
    console.log(`\nFound ${propertyTypes.length} property types:\n`);
    propertyTypes.slice(0, 5).forEach((type, index) => {
      console.log(`${index + 1}. ${type.property_type}`);
      console.log(`   Average Price: $${type.avg_price.toLocaleString()}`);
      console.log(`   Total Sales:   ${type.total_sales.toLocaleString()}`);
    });

    // Example 4: Search properties
    console.log('\n\n🔍 Example 4: Property Search (Melbourne, 3 bedrooms)');
    console.log('─'.repeat(60));
    const searchResults = await searchProperties({
      state: 'VIC',
      suburb: 'Melbourne',
      bedrooms: 3,
      limit: 5
    });
    console.log(`\nFound ${searchResults.total} properties (showing ${searchResults.data.length}):\n`);
    searchResults.data.forEach((property, index) => {
      console.log(`${index + 1}. ${property.suburb}, ${property.state}`);
      console.log(`   Type:      ${property.property_type}`);
      console.log(`   Price:     $${property.price_search_sold?.toLocaleString() || 'N/A'}`);
      console.log(`   Bedrooms:  ${property.bedrooms || 'N/A'}`);
      console.log(`   Bathrooms: ${property.bathrooms || 'N/A'}`);
      console.log(`   Sale Type: ${property.sale_type || 'N/A'}`);
    });

    console.log('\n\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export functions for use in other modules
export {
  apiRequest,
  getSuburbInsights,
  getPropertyTypeInsights,
  getPriceTrends,
  getSaleTypeInsights,
  getMarketStats,
  searchProperties,
};

