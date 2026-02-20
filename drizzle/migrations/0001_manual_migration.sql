-- Create new monitor_checks table for high-volume monitoring data
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

-- Add new columns to monitors table
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "name" varchar(255) NOT NULL DEFAULT 'unnamed';
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "interval_seconds" integer DEFAULT 300 NOT NULL;
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "timeout_seconds" integer DEFAULT 10 NOT NULL;
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "is_active" boolean DEFAULT true;
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "uptime_percentage" integer DEFAULT 100;

-- Add new columns to users table
ALTER TABLE "website_monitoring_users" ADD COLUMN "plan" varchar(50) DEFAULT 'free';

-- Add new columns to incidents table
ALTER TABLE "website_monitoring_incidents" ADD COLUMN "started_at" timestamp with time zone;
ALTER TABLE "website_monitoring_incidents" ADD COLUMN "resolved_at" timestamp with time zone;
ALTER TABLE "website_monitoring_incidents" ADD COLUMN "duration_seconds" integer;

-- Add foreign key constraint for monitor_checks
ALTER TABLE "website_monitoring_monitor_checks" ADD CONSTRAINT "website_monitoring_monitor_checks_monitor_id_website_monitoring_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."website_monitoring_monitors"("id") ON DELETE cascade ON UPDATE no action;

-- Note: We'll handle the UUID migration in a separate step after data is backed up
