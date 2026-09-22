import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where not supported
}

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  fallbackPrisma?: PrismaClient;
};

export const isTransientNetworkError = (error: any): boolean => {
  if (!error) return false;
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "");
  const name = String(error?.name || "");

  return (
    code === "P1001" ||
    code === "P1002" ||
    code === "P1008" ||
    code === "P1017" ||
    code === "P2024" ||
    name === "PrismaClientInitializationError" ||
    name === "PrismaClientRustPanicError" ||
    msg.includes("can't reach database server") ||
    msg.includes("connection closed") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("etimedout") ||
    msg.includes("ehostunreach") ||
    msg.includes("enotfound") ||
    msg.includes("eai_again") ||
    msg.includes("timed out") ||
    msg.includes("broken pipe") ||
    msg.includes("pooler")
  );
};

const basePrisma = new PrismaClient({
  log: ["error"],
});

// Fallback Prisma Client (Port 5432 standard PostgreSQL) for WiFis blocking port 6543
const fallbackUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL?.replace(":6543", ":5432");

export const fallbackPrisma =
  globalForPrisma.fallbackPrisma ||
  new PrismaClient({
    datasources: fallbackUrl ? { db: { url: fallbackUrl } } : undefined,
    log: ["error"],
  });
globalForPrisma.fallbackPrisma = fallbackPrisma;

// Resilient Prisma Client: Auto-retries drops with exponential backoff & auto dual-port failover
export const prisma = (
  globalForPrisma.prisma ||
  basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let retries = 3;
          let delay = 250;
          let triedFallback = false;

          while (true) {
            try {
              return await query(args);
            } catch (error: any) {
              if (isTransientNetworkError(error)) {
                if (retries > 0) {
                  retries--;
                  const jitter = Math.floor(Math.random() * 100);
                  console.warn(
                    `[Prisma Auto-Reconnect] ${String(model)}.${operation} connection dropped. Reconnecting in ${delay + jitter}ms... (${retries} retries left)`,
                  );
                  await new Promise((resolve) => setTimeout(resolve, delay + jitter));
                  delay *= 2;
                  continue;
                }

                // If port 6543 is blocked or failing on this WiFi, failover to port 5432
                if (
                  !triedFallback &&
                  fallbackPrisma &&
                  (fallbackPrisma as any)[model]?.[operation]
                ) {
                  triedFallback = true;
                  try {
                    console.warn(
                      `[Prisma Failover] Switching ${String(model)}.${operation} to session pooler port 5432 fallback...`,
                    );
                    const fallbackResult = await (fallbackPrisma as any)[model][operation](args);
                    console.log(
                      `[Prisma Failover] Successfully completed ${String(model)}.${operation} via port 5432!`,
                    );
                    return fallbackResult;
                  } catch (fallbackError) {
                    console.error(
                      `[Prisma Failover Failed] Port 5432 also unreachable:`,
                      fallbackError,
                    );
                  }
                }
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
  const start = Date.now();
  try {
    await prisma.$queryRawUnsafe("SELECT 1 as ready");
    const duration = Date.now() - start;
    console.log(`⚡ Primary database connection ready in ${duration}ms (pool ready)`);
  } catch (err) {
    console.warn("⚠️ Primary database warmup warning, testing port 5432 fallback:", err);
    try {
      await fallbackPrisma.$queryRawUnsafe("SELECT 1 as fallback_ready");
      console.log("⚡ Port 5432 fallback connection pre-warmed and ready");
    } catch (fallbackErr) {
      console.warn("⚠️ Both primary and fallback warmup warned (will retry on first request):", fallbackErr);
    }
  }
};

// Heartbeat ping every 2.5 minutes to prevent NAT / PgBouncer pooler connection drop
setInterval(async () => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1 as heartbeat");
  } catch {
    // Ignored, next query will auto-reconnect or failover
  }
}, 2.5 * 60 * 1000);

globalForPrisma.prisma = prisma;

export default prisma;
