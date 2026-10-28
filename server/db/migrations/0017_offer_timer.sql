CREATE TABLE "offer_timer" (
	"id" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"headline" text NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"duration_hours" integer NOT NULL,
	"auto_restart" boolean DEFAULT false NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offer_timer" ADD CONSTRAINT "offer_timer_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;