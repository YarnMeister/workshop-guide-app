import { pgTable, integer, date, varchar, boolean, index, char } from 'drizzle-orm/pg-core';

/**
 * Property Sales Table
 * 
 * Contains ~428k rows of property sales data for workshop participants.
 * Optimized with indexes for common query patterns:
 * - State filtering
 * - Suburb searches and aggregations
 * - Property type analysis
 * - Time-series queries
 * - Price-based sorting and aggregations
 */
export const propertySales = pgTable('property_sales', {
  financialYear: integer('financial_year'),
  activeMonth: date('active_month'),
  listingInstanceIdHash: char('listing_instance_id_hash', { length: 64 }),
  agencyIdHash: char('agency_id_hash', { length: 64 }),
  channel: varchar('channel'),
  propertyType: varchar('property_type'),
  propertyTypeGroup: varchar('property_type_group'),
  state: char('state', { length: 3 }),
  suburb: varchar('suburb'),
  postcode: char('postcode', { length: 4 }),
  stateSuburbPostcode: varchar('state_suburb_postcode'),
  priceSearch: integer('price_search'),
  priceSearchSold: integer('price_search_sold'),
  bedrooms: integer('bedrooms'),
  bedroomsGroup: varchar('bedrooms_group'),
  bathrooms: integer('bathrooms'),
  isNewConstruction: boolean('is_new_construction'),
  saleType: varchar('sale_type'),
}, (table) => ({
  // Single-column indexes for frequently filtered columns
  stateIdx: index('property_sales_state_idx').on(table.state),
  suburbIdx: index('property_sales_suburb_idx').on(table.suburb),
  propertyTypeIdx: index('property_sales_property_type_idx').on(table.propertyType),
  activeMonthIdx: index('property_sales_active_month_idx').on(table.activeMonth),
  priceSearchSoldIdx: index('property_sales_price_sold_idx').on(table.priceSearchSold),
  
  // Composite indexes for common filter combinations
  // Used in: /api/insights/suburbs?state=VIC
  stateSuburbIdx: index('property_sales_state_suburb_idx').on(table.state, table.suburb),
  
  // Used in: /api/insights/property-types?state=VIC
  statePropertyTypeIdx: index('property_sales_state_type_idx').on(table.state, table.propertyType),
  
  // Used in: time-series queries with state filter
  stateActiveMonthIdx: index('property_sales_state_month_idx').on(table.state, table.activeMonth),
  
  // Used in: price-based queries with state filter
  statePriceIdx: index('property_sales_state_price_idx').on(table.state, table.priceSearchSold),
}));

