CREATE TABLE "plan_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_prices_amount_positive" CHECK ("plan_prices"."amount_paise" > 0),
	CONSTRAINT "plan_prices_valid_range" CHECK ("plan_prices"."valid_to" IS NULL OR "plan_prices"."valid_to" > "plan_prices"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_reference" text NOT NULL,
	"plan_id" text NOT NULL,
	"plan_price_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_paise" integer NOT NULL,
	"line_paise" integer NOT NULL,
	"duration_months" integer,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"order_item_id" integer NOT NULL,
	"plan_id" text NOT NULL,
	"duration_months" integer,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entitlements_duration_positive" CHECK ("entitlements"."duration_months" IS NULL OR "entitlements"."duration_months" > 0)
);
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "duration_months" integer;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "available_from" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "available_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "max_quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "access_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lifetime_access" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_prices" ADD CONSTRAINT "plan_prices_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_reference_orders_reference_fk" FOREIGN KEY ("order_reference") REFERENCES "public"."orders"("reference") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_plan_price_id_plan_prices_id_fk" FOREIGN KEY ("plan_price_id") REFERENCES "public"."plan_prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plan_prices_plan_id_valid_from_idx" ON "plan_prices" USING btree ("plan_id","valid_from");--> statement-breakpoint
CREATE UNIQUE INDEX "order_items_order_plan_idx" ON "order_items" USING btree ("order_reference","plan_id");--> statement-breakpoint
CREATE INDEX "entitlements_user_id_granted_at_idx" ON "entitlements" USING btree ("user_id","granted_at");--> statement-breakpoint
CREATE INDEX "entitlements_order_item_id_idx" ON "entitlements" USING btree ("order_item_id");--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_duration_positive" CHECK ("plans"."duration_months" IS NULL OR "plans"."duration_months" > 0);--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_max_quantity_positive" CHECK ("plans"."max_quantity" > 0);--> statement-breakpoint
-- Durations from the display text: "1 month" → 1, "12 months" → 12. Anything else ("One-time")
-- stays null, which means lifetime: check the plans table after migrating.
UPDATE "plans" SET "duration_months" = substring("period" from '^(\d+) months?$')::integer;--> statement-breakpoint
-- Every plan's current price becomes its first plan_prices row. Change prices there from now on.
INSERT INTO "plan_prices" ("plan_id", "amount_paise", "valid_from")
SELECT "id", "amount_paise", now() FROM "plans";--> statement-breakpoint
-- Each existing order becomes a one-line order. Their price rows weren't kept, so plan_price_id stays null.
INSERT INTO "order_items" ("order_reference", "plan_id", "quantity", "unit_paise", "line_paise", "duration_months")
SELECT o."reference", o."plan_id", 1, o."amount_paise", o."amount_paise", p."duration_months"
FROM "orders" o JOIN "plans" p ON p."id" = o."plan_id";
