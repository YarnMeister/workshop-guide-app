CREATE TABLE "participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"api_key" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "participants_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX "idx_participants_code" ON "participants" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_participants_active" ON "participants" USING btree ("is_active");