import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

/**
 * Postgres connection pool singleton (node-postgres), mirroring
 * fabp-landing-pages' lib/db.ts. Configs + leads both live here.
 */

declare global {
  // eslint-disable-next-line no-var
  var __aePgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — the database is required for configs and leads.");
  }
  return new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX ?? 10),
    idleTimeoutMillis: Number(process.env.PG_POOL_IDLE_TIMEOUT_MS ?? 30_000),
    connectionTimeoutMillis: Number(process.env.PG_POOL_CONNECTION_TIMEOUT_MS ?? 10_000),
  });
}

export function getPool(): Pool {
  if (!global.__aePgPool) global.__aePgPool = createPool();
  return global.__aePgPool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params as never);
}

/** Run a function with a dedicated client (for transactions / advisory locks). */
export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export function getPoolStats() {
  const pool = getPool();
  return { total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount };
}
