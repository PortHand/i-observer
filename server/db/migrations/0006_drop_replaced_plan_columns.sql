ALTER TABLE "plans" DROP CONSTRAINT "plans_amount_positive";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_plan_id_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_plan_id_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN "amount_paise";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "plan_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "plan_id";