CREATE TABLE IF NOT EXISTS "oauth_linked_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"issuer" text,
	"external_account_id" text,
	"external_account_email" text
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_external_account_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "external_account_id";