import type { Prisma } from "../database/prisma.ts";
import { type Logger } from "../utils/logger.ts";

const kStaleArchivedThresholdMs = 3 * 30 * 24 * 60 * 60 * 1000; // ~3 months

export class CleanupArchivedTask {
  #db: Prisma;
  #logger: Logger;

  constructor(db: Prisma, logger: Logger) {
    this.#db = db;
    this.#logger = logger.child({ name: "cleanup-archived-task" });
  }

  async run(): Promise<void> {
    const cutoff = new Date(Date.now() - kStaleArchivedThresholdMs);
    this.#logger.info(
      `Deleting archived threads with archived_at before ${cutoff.toISOString()}`,
    );

    const result = await this.#db.instance.thread.deleteMany({
      where: {
        archived: true,
        archived_at: { lt: cutoff },
      },
    });

    this.#logger.info(`Deleted ${result.count} stale archived thread(s).`);
  }
}
