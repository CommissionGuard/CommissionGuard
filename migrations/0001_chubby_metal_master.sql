CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" serial NOT NULL,
	"amount" varchar NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"status" varchar NOT NULL,
	"payment_method" varchar NOT NULL,
	"stripe_payment_id" varchar,
	"failure_reason" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"plan" varchar NOT NULL,
	"status" varchar NOT NULL,
	"amount" varchar NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"billing_cycle" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"payment_method" varchar,
	"stripe_subscription_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" varchar DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_plan" varchar DEFAULT 'basic';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_payment_date" timestamp;