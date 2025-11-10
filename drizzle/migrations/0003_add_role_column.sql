ALTER TABLE "participants" ADD COLUMN "role" varchar(20) DEFAULT 'participant' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_participants_role" ON "participants" USING btree ("role");--> statement-breakpoint
UPDATE "participants" SET "role" = 'facilitator' WHERE "code" IN ('Jan', 'Sarah', 'Wang Yi', 'Danni', 'Erik');

