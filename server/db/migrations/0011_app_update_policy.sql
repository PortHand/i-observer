CREATE TABLE "app_update_policy" (
	"id" text PRIMARY KEY NOT NULL,
	"force_update" boolean DEFAULT false NOT NULL,
	"minimum_version" text NOT NULL,
	"message" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_update_policy" ADD CONSTRAINT "app_update_policy_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;