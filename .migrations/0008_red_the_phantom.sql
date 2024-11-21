ALTER TABLE "oauth_linked_accounts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_linked_accounts" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_linked_accounts" ALTER COLUMN "external_account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_linked_accounts" ALTER COLUMN "external_account_email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;