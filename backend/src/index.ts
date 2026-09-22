import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import dotenv from "dotenv";
dotenv.config();

// Connected to Supabase Singapore (ap-southeast-1) via Transaction Pooler port 6543
import app from "./app";
import cluster from "cluster";
import os from "os";
import { warmupDatabase } from "./config/prisma";
import { preloadProductCache } from "./controllers/product.controller";
import { preloadPricesCache } from "./controllers/hub.controller";

const port = process.env.PORT || 4000;

if (
  cluster.isPrimary &&
  process.env.NODE_ENV === "production"
) {
  const workerCount = Math.max(
    1,
    Math.min(os.cpus().length, 4),
  );
  console.log(
    `🚀 Primary cluster setting up ${workerCount} worker processes...`,
  );

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  cluster.on(
    "exit",
    (worker, code, signal) => {
      console.log(
        `Worker ${worker.process.pid} died. Respawning...`,
      );
      cluster.fork();
    },
  );
} else {
  const server = app.listen(port, () => {
    console.log(
      `Server running on http://localhost:${port} (PID: ${process.pid})`,
    );

    // ⚡ Ultra-Fast Zero-Cold-Start Warmup (Pre-warm DB & RAM cache)
    warmupDatabase()
      .then(() => Promise.all([preloadProductCache(), preloadPricesCache()]))
      .catch((e) => console.warn("Warmup notice:", e));
  });

  // Optimize HTTP keep-alive connections for performance
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds
}
