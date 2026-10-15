CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"order_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_rating_range" CHECK ("feedback"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_order_reference_orders_reference_fk" FOREIGN KEY ("order_reference") REFERENCES "public"."orders"("reference") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_user_id_created_at_idx" ON "feedback" USING btree ("user_id","created_at");