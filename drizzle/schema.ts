import { pgTable, serial, text, varchar, integer, timestamp, boolean, pgTableCreator, bigserial, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Create table helper
export const createTable = pgTableCreator((name) => `website_monitoring_${name}`);

// 🔹 Users table - minimal since Clerk manages most user data
export const users = createTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  name: text('full_name'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 🔹 Organizations table - tenant container
export const organizations = createTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkOrganizationId: varchar('clerk_organization_id', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  type: varchar('type', { length: 20 }).default('personal').notNull(), // 'personal', 'team', 'enterprise'
  plan: varchar('plan', { length: 50 }).default('free').notNull(),
  maxMonitors: integer('max_monitors').default(5),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 🔹 Organization Members table - CRITICAL for multi-tenancy
export const organizationMembers = createTable('organization_members', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  clerkMembershipId: varchar('clerk_membership_id', { length: 255 }).unique().notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'), // 'owner', 'admin', 'member'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 🔹 Monitors table - now belongs to organization
export const monitors = createTable('monitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 2048 }).notNull(),
  intervalSeconds: integer('interval_seconds').notNull().default(300), // 5 minutes default
  timeoutSeconds: integer('timeout_seconds').notNull().default(10), // 10 seconds default
  isActive: boolean('is_active').default(true),
  status: varchar('status', { length: 20 }).default('up').notNull(),
  uptimePercentage: integer('uptime_percentage').default(100), // New field for efficient calculation
  lastCheckAt: timestamp('last_check_at', { withTimezone: true }).defaultNow().notNull(),
  responseTimeMs: integer('response_time_ms').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 🔹 Monitor Checks table - high volume table for all monitoring results
export const monitorChecks = createTable('monitor_checks', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  monitorId: uuid('monitor_id').references(() => monitors.id, { onDelete: 'cascade' }).notNull(),
  status: boolean('status').notNull(), // true = up, false = down
  statusCode: integer('status_code'),
  responseTimeMs: integer('response_time_ms').notNull(),
  errorType: varchar('error_type', { length: 100 }),
  region: varchar('region', { length: 50 }).default('us-east-1'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).defaultNow().notNull(),
});

// 🔹 Incidents table - downtime sessions (production-grade design)
export const incidents = createTable('incidents', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  monitorId: uuid('monitor_id').references(() => monitors.id, { onDelete: 'cascade' }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Define relations for better type safety
export const usersRelations = relations(users, ({ many }) => ({
  organizationMembers: many(organizationMembers),
  createdMonitors: many(monitors),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  monitors: many(monitors),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const monitorsRelations = relations(monitors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [monitors.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [monitors.createdBy],
    references: [users.id],
  }),
  checks: many(monitorChecks),
  incidents: many(incidents),
}));

export const monitorChecksRelations = relations(monitorChecks, ({ one }) => ({
  monitor: one(monitors, {
    fields: [monitorChecks.monitorId],
    references: [monitors.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  monitor: one(monitors, {
    fields: [incidents.monitorId],
    references: [monitors.id],
  }),
}));

// Types for better TypeScript support
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
export type Monitor = typeof monitors.$inferSelect;
export type NewMonitor = typeof monitors.$inferInsert;
export type MonitorCheck = typeof monitorChecks.$inferSelect;
export type NewMonitorCheck = typeof monitorChecks.$inferInsert;
export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;

// Status Reports table - legacy table, consider migrating to monitor_checks
export const statusReports = createTable('status_reports', {
  id: serial('id').primaryKey(),
  monitorId: uuid('monitor_id').references(() => monitors.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 2048 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'up' | 'down'
  responseTime: integer('response_time').notNull(), // Response time in milliseconds
  error: text('error'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
});
