import { PrismaClient } from "@prisma/client";

const globalForPrisma =
  globalThis as unknown as {
    prisma: PrismaClient;
  };

const basePrisma = new PrismaClient({
  log: ["error"],
});

// Resilient Prisma Client: Auto-retries transient connection drops (P1001/PgBouncer timeouts)
export const prisma = (
  globalForPrisma.prisma ||
  basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let retries = 2;
          let delay = 300;
          while (true) {
            try {
              return await query(args);
            } catch (error: any) {
              const isTransientConnectionError =
                error?.code === "P1001" ||
                error?.code === "P1002" ||
                error?.code === "P1008" ||
                error?.code === "P1017" ||
                error?.name === "PrismaClientInitializationError" ||
                error?.message?.includes("Can't reach database server") ||
                error?.message?.includes("Connection closed") ||
                error?.message?.includes("ECONNRESET");

              if (isTransientConnectionError && retries > 0) {
                retries--;
                console.warn(
                  `[Prisma Auto-Reconnect] ${model}.${operation} connection dropped. Reconnecting in ${delay}ms... (${retries} retries left)`,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
                continue;
              }
              throw error;
            }
          }
        },
      },
    },
  })
) as unknown as PrismaClient;

export const warmupDatabase = async (): Promise<void> => {
  try {
    const start = Date.now();
    await prisma.$queryRawUnsafe("SELECT 1 as ready");
    const duration = Date.now() - start;
    console.log(`⚡ Database connection pre-warmed in ${duration}ms (pool ready)`);
  } catch (err) {
    console.warn("⚠️ Database warmup warning (will retry on first request):", err);
  }
};

// Heartbeat ping every 3 minutes to keep Supabase PgBouncer pooler connection warm
setInterval(async () => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1 as heartbeat");
  } catch {
    // Ignored, next query will auto-reconnect
  }
}, 3 * 60 * 1000);

globalForPrisma.prisma = prisma;

export default prisma;
