-- Multi-Tenant Organization Migration
-- This migration transforms the single-user SaaS into a proper multi-tenant SaaS

-- Create organizations table
CREATE TABLE IF NOT EXISTS website_monitoring_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_organization_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'free' NOT NULL,
    max_monitors INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create organization_members table (CRITICAL for multi-tenancy)
CREATE TABLE IF NOT EXISTS website_monitoring_organization_members (
    id BIGSERIAL PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES website_monitoring_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES website_monitoring_users(id) ON DELETE CASCADE,
    clerk_membership_id VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'member' NOT NULL, -- 'owner', 'admin', 'member'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Update monitors table to belong to organizations
ALTER TABLE website_monitoring_monitors 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES website_monitoring_organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES website_monitoring_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS interval_seconds INTEGER DEFAULT 300 NOT NULL,
ADD COLUMN IF NOT EXISTS timeout_seconds INTEGER DEFAULT 10 NOT NULL,
ADD COLUMN IF NOT EXISTS uptime_percentage INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS last_check_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Create monitor_checks table (high volume table)
CREATE TABLE IF NOT EXISTS website_monitoring_monitor_checks (
    id BIGSERIAL PRIMARY KEY,
    monitor_id UUID NOT NULL REFERENCES website_monitoring_monitors(id) ON DELETE CASCADE,
    status BOOLEAN NOT NULL, -- true = up, false = down
    status_code INTEGER,
    response_time_ms INTEGER NOT NULL,
    error_type VARCHAR(100),
    region VARCHAR(50) DEFAULT 'us-east-1',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create incidents table (downtime sessions)
CREATE TABLE IF NOT EXISTS website_monitoring_incidents (
    id BIGSERIAL PRIMARY KEY,
    monitor_id UUID NOT NULL REFERENCES website_monitoring_monitors(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON website_monitoring_organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON website_monitoring_organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_monitors_organization_id ON website_monitoring_monitors(organization_id);
CREATE INDEX IF NOT EXISTS idx_monitor_checks_monitor_id ON website_monitoring_monitor_checks(monitor_id);
CREATE INDEX IF NOT EXISTS idx_monitor_checks_checked_at ON website_monitoring_monitor_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_incidents_monitor_id ON website_monitoring_incidents(monitor_id);
CREATE INDEX IF NOT EXISTS idx_incidents_started_at ON website_monitoring_incidents(started_at);

-- Update existing users table to be minimal (Clerk manages most data)
ALTER TABLE website_monitoring_users 
DROP COLUMN IF EXISTS plan,
DROP COLUMN IF EXISTS monitors_limit,
DROP COLUMN IF EXISTS monitors_count,
DROP COLUMN IF EXISTS subscription_tier,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS is_active,
DROP COLUMN IF EXISTS last_sign_in_at;

-- Add clerk_id if it doesn't exist
ALTER TABLE website_monitoring_users 
ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE NOT NULL;

-- Set clerk_id from existing id for migration
UPDATE website_monitoring_users 
SET clerk_id = id::text 
WHERE clerk_id IS NULL;

-- Migrate existing monitors to have organization_id (temporary - will be handled by organization creation)
-- This will be NULL until users create organizations and migrate their monitors

-- Clean up old columns from monitors table
ALTER TABLE website_monitoring_monitors 
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS uptime,
DROP COLUMN IF EXISTS last_check,
DROP COLUMN IF EXISTS response_time,
DROP COLUMN IF EXISTS incidents,
DROP COLUMN IF EXISTS interval,
DROP COLUMN IF EXISTS owner,
DROP COLUMN IF EXISTS organization;

-- Drop old status_reports table if it exists
DROP TABLE IF EXISTS website_monitoring_status_reports;
