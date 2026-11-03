-- OpenRouter is gone: a run's key minted there can't be managed as a Bifrost key. Those keys are
-- disabled and expire on their own; forgotten here, such a run settles at $0.
UPDATE "runs" SET "key_hash" = NULL, "key_secret" = NULL WHERE "key_backend" = 'openrouter';--> statement-breakpoint
ALTER TABLE "runs" DROP COLUMN "key_backend";--> statement-breakpoint
DROP TYPE "llm_backend";
