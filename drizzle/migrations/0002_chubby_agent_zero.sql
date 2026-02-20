CREATE TABLE "website_monitoring_organization_members" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"clerk_membership_id" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "website_monitoring_organization_members_clerk_membership_id_unique" UNIQUE("clerk_membership_id")
);
--> statement-breakpoint
CREATE TABLE "website_monitoring_organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_organization_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"plan" varchar(50) DEFAULT 'free' NOT NULL,
	"max_monitors" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "website_monitoring_organizations_clerk_organization_id_unique" UNIQUE("clerk_organization_id"),
	CONSTRAINT "website_monitoring_organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP CONSTRAINT "website_monitoring_incidents_user_id_website_monitoring_users_id_fk";
--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP CONSTRAINT "website_monitoring_monitors_user_id_website_monitoring_users_id_fk";
--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ALTER COLUMN "monitor_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ALTER COLUMN "started_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "website_monitoring_monitor_checks" ALTER COLUMN "monitor_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "website_monitoring_users" ALTER COLUMN "clerk_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "last_check_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD COLUMN "response_time_ms" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "website_monitoring_organization_members" ADD CONSTRAINT "website_monitoring_organization_members_organization_id_website_monitoring_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."website_monitoring_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_monitoring_organization_members" ADD CONSTRAINT "website_monitoring_organization_members_user_id_website_monitoring_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."website_monitoring_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD CONSTRAINT "website_monitoring_monitors_organization_id_website_monitoring_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."website_monitoring_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" ADD CONSTRAINT "website_monitoring_monitors_created_by_website_monitoring_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."website_monitoring_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "response_time";--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "error";--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "timestamp";--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "downtime";--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "is_recovery";--> statement-breakpoint
ALTER TABLE "website_monitoring_incidents" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP COLUMN "uptime";--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP COLUMN "last_check";--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP COLUMN "response_time";--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP COLUMN "incidents";--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP COLUMN "interval";--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP COLUMN "owner";--> statement-breakpoint
ALTER TABLE "website_monitoring_monitors" DROP COLUMN "organization";--> statement-breakpoint
ALTER TABLE "website_monitoring_users" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "website_monitoring_users" DROP COLUMN "last_sign_in_at";--> statement-breakpoint
ALTER TABLE "website_monitoring_users" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "website_monitoring_users" DROP COLUMN "subscription_tier";--> statement-breakpoint
ALTER TABLE "website_monitoring_users" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "website_monitoring_users" DROP COLUMN "monitors_limit";--> statement-breakpoint
ALTER TABLE "website_monitoring_users" DROP COLUMN "monitors_count";