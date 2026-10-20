ALTER TABLE "plans" ADD COLUMN "duration_hours" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "duration_hours" integer;--> statement-breakpoint
ALTER TABLE "entitlements" ADD COLUMN "duration_hours" integer;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_duration_hours_positive" CHECK ("plans"."duration_hours" IS NULL OR "plans"."duration_hours" > 0);--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_one_duration_unit" CHECK ("plans"."duration_months" IS NULL OR "plans"."duration_hours" IS NULL);--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_duration_hours_positive" CHECK ("entitlements"."duration_hours" IS NULL OR "entitlements"."duration_hours" > 0);