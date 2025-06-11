CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar NOT NULL,
	"contract_id" serial NOT NULL,
	"client_id" serial NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"severity" varchar DEFAULT 'medium' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"details" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar NOT NULL,
	"full_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_signers" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" serial NOT NULL,
	"signer_name" varchar NOT NULL,
	"signer_email" varchar,
	"signer_phone" varchar,
	"signer_role" varchar NOT NULL,
	"signed_date" timestamp,
	"signature_status" varchar DEFAULT 'pending' NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" serial NOT NULL,
	"agent_id" varchar NOT NULL,
	"representation_type" varchar NOT NULL,
	"property_address" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"contract_file_url" text,
	"contract_file_name" varchar,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'agent' NOT NULL,
	"brokerage_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");