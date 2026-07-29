interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  [key: string]: unknown;
}

class Logger {
  log(
    level: "info" | "warn" | "error",
    message: string,
    context?: LogContext,
  ) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };

    // In production, this can be sent to Datadog, Axiom, CloudWatch, etc.
    // For now, output as structured JSON to standard output/error
    if (level === "error") {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  info(
    message: string,
    context?: LogContext,
  ) {
    this.log("info", message, context);
  }

  warn(
    message: string,
    context?: LogContext,
  ) {
    this.log("warn", message, context);
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: LogContext,
  ) {
    this.log("error", message, {
      ...context,
      error:
        error instanceof Error
          ? error.message
          : String(error),
      stack:
        error instanceof Error &&
        process.env.NODE_ENV ===
          "development"
          ? error.stack
          : undefined,
    });
  }
}

export const logger = new Logger();
