CREATE TABLE "website_monitoring_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"monitor_id" integer,
	"user_id" integer,
	"url" varchar(2048) NOT NULL,
	"status" varchar(20) NOT NULL,
	"response_time" varchar(50) NOT NULL,
	"error" text,
	"timestamp" timestamp NOT NULL,
	"downtime" varchar(100),
	"is_recovery" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_monitoring_monitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"url" varchar(2048) NOT NULL,
	"status" varchar(20) DEFAULT 'up' NOT NULL,
	"uptime" varchar(100) DEFAULT '100%' NOT NULL,
	"last_check" timestamp DEFAULT now() NOT NULL,
	"response_time" varchar(50) DEFAULT '0ms' NOT NULL,
	"incidents" integer DEFAULT 0 NOT NULL,
	"interval" varchar(50) NOT NULL,
	"owner" text,
	"organization" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_monitoring_status_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"monitor_id" integer,
	"url" varchar(2048) NOT NULL,
	"status" varchar(20) NOT NULL,
	"response_time" integer NOT NULL,
	"error" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_monitoring_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"full_name" text,
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_sign_in_at" timestamp,
	"is_active" boolean DEFAULT true,
	"subscription_tier" varchar(50) DEFAULT 'free',
	"subscription_status" varchar(50) DEFAULT 'active',
	"monitors_limit" integer DEFAULT 5,
	"monitors_count" integer DEFAULT 0,
	CONSTRAINT "website_monitoring_users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ADD CONSTRAINT "website_monitoring_incidents_monitor_id_website_monitoring_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."website_monitoring_monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ADD CONSTRAINT "website_monitoring_incidents_user_id_website_monitoring_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."website_monitoring_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD CONSTRAINT "website_monitoring_monitors_user_id_website_monitoring_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."website_monitoring_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_monitoring_status_reports" ADD CONSTRAINT "website_monitoring_status_reports_monitor_id_website_monitoring_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."website_monitoring_monitors"("id") ON DELETE cascade ON UPDATE no action;