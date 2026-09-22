import { logger } from "./logger";

export class JobQueue<T> {
  private queue: T[] = [];
  private activeWorkers = 0;

  constructor(
    private executor: (job: T) => Promise<void>,
    private concurrency: number = 3,
  ) {}

  async add(job: T): Promise<void> {
    this.queue.push(job);
    this.dispatch();
  }

  private dispatch(): void {
    while (this.activeWorkers < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift()!;
      this.activeWorkers++;
      this.runJob(job);
    }
  }

  private async runJob(job: T): Promise<void> {
    try {
      await this.executor(job);
    } catch (error) {
      logger.error("Job execution failed", error, { job });
    } finally {
      this.activeWorkers--;
      this.dispatch();
    }
  }

  get size(): number {
    return this.queue.length;
  }

  get isIdle(): boolean {
    return this.activeWorkers === 0 && this.queue.length === 0;
  }
}
