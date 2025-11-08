-- Migration: Add performance indexes to existing property_sales table
-- Table already exists with 428k+ rows, only adding indexes
-- This migration is safe to run on existing data


CREATE INDEX "property_sales_state_idx" ON "property_sales" USING btree ("state");--> statement-breakpoint
CREATE INDEX "property_sales_suburb_idx" ON "property_sales" USING btree ("suburb");--> statement-breakpoint
CREATE INDEX "property_sales_property_type_idx" ON "property_sales" USING btree ("property_type");--> statement-breakpoint
CREATE INDEX "property_sales_active_month_idx" ON "property_sales" USING btree ("active_month");--> statement-breakpoint
CREATE INDEX "property_sales_price_sold_idx" ON "property_sales" USING btree ("price_search_sold");--> statement-breakpoint
CREATE INDEX "property_sales_state_suburb_idx" ON "property_sales" USING btree ("state","suburb");--> statement-breakpoint
CREATE INDEX "property_sales_state_type_idx" ON "property_sales" USING btree ("state","property_type");--> statement-breakpoint
CREATE INDEX "property_sales_state_month_idx" ON "property_sales" USING btree ("state","active_month");--> statement-breakpoint
CREATE INDEX "property_sales_state_price_idx" ON "property_sales" USING btree ("state","price_search_sold");