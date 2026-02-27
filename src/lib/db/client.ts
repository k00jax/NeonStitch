import { Pool, PoolClient, QueryResult } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for Etsy inventory sync");
  }

  pool = new Pool({
    connectionString,
  });

  return pool;
}

export async function dbQuery<T>(text: string, values: unknown[] = []): Promise<QueryResult<T>> {
  return getPool().query<T>(text, values);
}

export async function withDbTransaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const txPool = getPool();
  const client = await txPool.connect();
  await client.query("BEGIN");
  try {
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
