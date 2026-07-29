import { logger } from "./logger";

export class JobQueue<T> {
  private queue: T[] = [];
  private processing = false;

  constructor(
    private executor: (
      job: T,
    ) => Promise<void>,
  ) {}

  async add(job: T): Promise<void> {
    this.queue.push(job);
    if (!this.processing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      try {
        await this.executor(job);
      } catch (error) {
        logger.error(
          "Job execution failed",
          error,
          { job },
        );
      }
    }

    this.processing = false;
  }
}
