CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"period" text NOT NULL,
	"description" text NOT NULL,
	"badge" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_amount_positive" CHECK ("plans"."amount_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "upi_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"upi_id" text NOT NULL,
	"payee_name" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"reference" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"upi_id" text NOT NULL,
	"payee_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"utr" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "plans_one_default_idx" ON "plans" USING btree ("is_default") WHERE "plans"."is_default";--> statement-breakpoint
CREATE UNIQUE INDEX "upi_accounts_one_active_idx" ON "upi_accounts" USING btree ("active") WHERE "upi_accounts"."active";--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_status_created_at_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_utr_idx" ON "orders" USING btree ("utr");--> statement-breakpoint
-- Starting plans, the same ones the site showed before prices moved to the database. Edit them in
-- the plans table from now on.
INSERT INTO "plans" ("id", "name", "amount_paise", "period", "description", "badge", "sort_order", "is_default") VALUES
	('monthly', 'Monthly', 49900, '1 month', 'Try it for an interview season or a busy month.', NULL, 1, false),
	('yearly', 'Yearly', 399900, '12 months', 'Two-thirds off the monthly price for regular presenters.', 'Best value', 2, true),
	('lifetime', 'Lifetime', 799900, 'One-time', 'Pay once, including every future update.', NULL, 3, false);
