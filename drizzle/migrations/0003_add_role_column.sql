-- Migration: Add role column to participants table for role-based access control
-- This enables splitting the workshop experience into:
-- 1. Pre-workshop access (participants) - limited to Setup Tools page only
-- 2. Full E2E access (facilitators) - complete workshop experience for testing

-- Step 1: Add role column with default value 'participant'
ALTER TABLE "participants" ADD COLUMN "role" varchar(20) DEFAULT 'participant' NOT NULL;--> statement-breakpoint

-- Step 2: Create index for role-based queries
CREATE INDEX "idx_participants_role" ON "participants" USING btree ("role");--> statement-breakpoint

-- Step 3: Update facilitators to 'facilitator' role
-- Facilitators: Jan, Sarah, Wang Yi, Danni, Erik
UPDATE "participants" SET "role" = 'facilitator' WHERE "code" IN ('Jan', 'Sarah', 'Wang Yi', 'Danni', 'Erik');

