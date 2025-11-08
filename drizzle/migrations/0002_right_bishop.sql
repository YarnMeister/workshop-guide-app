-- Step 1: Add cert_id column as nullable
ALTER TABLE "participants" ADD COLUMN "cert_id" integer;--> statement-breakpoint

-- Step 2: Populate cert_id with unique sequential numbers (1001, 1002, 1003, etc.)
-- Using 1000+ range to avoid conflicts with potential future auto-increment IDs
WITH numbered_participants AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) + 1000 AS cert_num
  FROM participants
)
UPDATE participants
SET cert_id = numbered_participants.cert_num
FROM numbered_participants
WHERE participants.id = numbered_participants.id;--> statement-breakpoint

-- Step 3: Make cert_id NOT NULL
ALTER TABLE "participants" ALTER COLUMN "cert_id" SET NOT NULL;--> statement-breakpoint

-- Step 4: Add unique constraint
ALTER TABLE "participants" ADD CONSTRAINT "participants_cert_id_unique" UNIQUE("cert_id");--> statement-breakpoint

-- Step 5: Create index for fast lookups
CREATE INDEX "idx_participants_cert_id" ON "participants" USING btree ("cert_id");