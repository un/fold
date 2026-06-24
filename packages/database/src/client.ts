import "dotenv/config"

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool, type PoolConfig } from "pg"

import { schema } from "./schema"

const DEFAULT_DATABASE_URL_ENV = "DATABASE_URL"

export const planetscalePgBouncerPort = "6432"

export type DatabaseSchema = typeof schema
export type Database = NodePgDatabase<DatabaseSchema>

export type CreateDatabaseClientOptions = {
  connectionString?: string
  envVarName?: string
  pool?: Omit<PoolConfig, "connectionString">
}

export function createDatabaseClient(
  options: CreateDatabaseClientOptions = {},
): Database {
  const connectionString = getDatabaseUrl(options)
  const pool = new Pool({
    connectionString,
    ...options.pool,
  })

  return drizzle(pool, { schema })
}

export function getDatabaseUrl(options: CreateDatabaseClientOptions = {}) {
  const envVarName = options.envVarName ?? DEFAULT_DATABASE_URL_ENV
  const connectionString = options.connectionString ?? process.env[envVarName]

  if (!connectionString) {
    throw new Error(`Missing ${envVarName} for database connection.`)
  }

  return connectionString
}

export function isPgBouncerConnectionString(connectionString: string) {
  return new URL(connectionString).port === planetscalePgBouncerPort
}
