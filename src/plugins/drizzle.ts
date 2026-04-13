import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolConfig } from "pg";

interface DBOptions extends FastifyPluginOptions {
  url: string;
  poolConfig?: Partial<PoolConfig>;
}

const drizzlePlugin = fp(
  async (fastify: FastifyInstance, options: DBOptions) => {
    if (!options.url) {
      throw new Error("Database URL is required");
    }

    const poolConfig: PoolConfig = {
      connectionString: options.url,
      max: 20,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      ...options.poolConfig,
    };

    const pool = new Pool(poolConfig);

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const client = await pool.connect();
        fastify.log.info("Database connected successfully");
        client.release();
        break;
      } catch (error) {
        retries++;
        const err = error instanceof Error ? error : new Error(String(error));

        if (retries >= maxRetries) {
          fastify.log.error(
            err,
            `Failed to connect to database after ${maxRetries} attempts`
          );
          throw err;
        }

        fastify.log.warn(
          err,
          `Database connection attempt ${retries}/${maxRetries} failed, retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }

    const db = drizzle(pool);
    fastify.decorate("db", db);

    fastify.addHook("onClose", async () => {
      fastify.log.info("Closing database connection pool");
      await pool.end();
    });
  },
  {
    name: "drizzle-plugin",
    fastify: "5.x",
  }
);

export default drizzlePlugin;
