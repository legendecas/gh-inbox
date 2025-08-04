import type { Prisma } from "./database/prisma.ts";
import { GitHubClient } from "./github/client.js";
import { FetchNotificationsTask } from "./tasks/fetch-notifications.ts";
import { logger } from "./utils/logger.ts";

const kTaskRunnerInterval = 3 * 60 * 1000; // 3 minutes

export class TaskRunner {
  #db: Prisma;
  #timer: NodeJS.Timeout | null = null;

  constructor(db: Prisma) {
    this.#db = db;
  }

  async schedule() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }

    const endpoints = await this.#db.instance.endpoint.findMany();

    for (const endpoint of endpoints) {
      await this.scheduleForEndpoint(endpoint.id);
    }
  }

  async scheduleForEndpoint(endpointId: number) {
    const task = await this.#db.instance.task.findFirst({
      where: { type: "task-runner", endpoint_id: endpointId },
    });
    if (task == null) {
      logger.log("No task found, starting TaskRunner.");
      this.scheduleNextRun(endpointId, 0);
      return;
    }
    const nextRunDelay =
      kTaskRunnerInterval + task.last_run.getTime() - Date.now();
    this.scheduleNextRun(endpointId, nextRunDelay);
  }

  private scheduleNextRun(endpointId: number, delay: number) {
    if (delay < 0) {
      logger.log(
        `Scheduling TaskRunner for endpoint ${endpointId} immediately.`,
      );
      delay = 0;
    } else {
      logger.log(
        `Scheduling TaskRunner for endpoint ${endpointId} in ${delay} ms.`,
      );
    }
    this.#timer = setTimeout(() => {
      this.run(endpointId).catch((error) => {
        logger.error("Error running TaskRunner:", error);
      });
    }, delay);
  }

  private async run(endpointId: number) {
    logger.log("Running TaskRunner...");
    const task = await this.#db.instance.task.findFirst({
      where: { type: "task-runner", endpoint_id: endpointId },
    });
    const lastRun = task?.last_run;

    await this.runTasksForEndpoint(endpointId, lastRun);
    logger.log(`TaskRunner completed for endpoint ${endpointId}.`);

    const now = new Date();
    if (task == null) {
      await this.#db.instance.task.create({
        data: {
          type: "task-runner",
          endpoint_id: endpointId,
          data: "",
          last_run: now,
        },
      });
    } else {
      await this.#db.instance.task.update({
        where: { id: task.id },
        data: { last_run: now },
      });
    }
    this.scheduleNextRun(endpointId, kTaskRunnerInterval);
  }

  private async runTasksForEndpoint(endpointId: number, lastRun?: Date) {
    const endpoint = await this.#db.instance.endpoint.findUnique({
      where: { id: endpointId },
    });
    if (!endpoint) {
      logger.error(`Endpoint with ID ${endpointId} not found.`);
      return;
    }
    logger.log(`Running tasks for endpoint ${endpointId}...`);
    const gh = new GitHubClient(
      endpoint.url,
      endpoint.token,
      endpoint.proxy_url,
    );

    try {
      const task = new FetchNotificationsTask(
        this.#db,
        gh,
        endpointId,
        lastRun,
      );
      await task.run();
    } catch (error) {
      logger.error(`Error running task for endpoint ${endpointId}:`, error);
    }
  }
}
