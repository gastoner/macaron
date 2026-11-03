ALTER TABLE "users" ADD COLUMN "onboarded_at" timestamp with time zone;--> statement-breakpoint
-- Accounts that already used the app skip the onboarding: it opens for new ones only.
UPDATE "users" SET "onboarded_at" = "created_at";
