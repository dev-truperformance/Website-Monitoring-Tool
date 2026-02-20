CREATE TABLE "website_monitoring_monitor_checks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"monitor_id" uuid,
	"status" boolean NOT NULL,
	"status_code" integer,
	"response_time_ms" integer NOT NULL,
	"error_type" varchar(100),
	"region" varchar(50) DEFAULT 'us-east-1',
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ALTER COLUMN "monitor_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ALTER COLUMN "timestamp" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "website_monitoring_status_reports" ALTER COLUMN "monitor_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "website_monitoring_users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "website_monitoring_users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ADD COLUMN "started_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ADD COLUMN "duration_seconds" integer;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "interval_seconds" integer DEFAULT 300 NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "timeout_seconds" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "uptime_percentage" integer DEFAULT 100;--> statement-breakpoint
ALTER TABLE "website_monitoring_users" ADD COLUMN "plan" varchar(50) DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "website_monitoring_monitor_checks" ADD CONSTRAINT "website_monitoring_monitor_checks_monitor_id_website_monitoring_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."website_monitoring_monitors"("id") ON DELETE cascade ON UPDATE no action;