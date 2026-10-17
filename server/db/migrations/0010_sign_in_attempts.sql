CREATE TABLE "sign_in_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"username_hash" text NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sign_in_attempts_username_created_at_idx" ON "sign_in_attempts" USING btree ("username_hash","created_at");--> statement-breakpoint
CREATE INDEX "sign_in_attempts_ip_created_at_idx" ON "sign_in_attempts" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "sign_in_attempts_created_at_idx" ON "sign_in_attempts" USING btree ("created_at");