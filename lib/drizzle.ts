import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../drizzle/schema'

// Disable prefetch as it is not supported for "Transaction" pool mode
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const client = postgres(connectionString, {
  prepare: false,
  max: 1 // Connection limit for pooler
})

export const db = drizzle(client, { schema })

// Export types for use in API routes
export type Database = typeof db
export { schema }
