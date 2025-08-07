import type { Endpoint } from "../generated/prisma/index.js";
import type { Prisma } from "./database/prisma.ts";
import { GitHubClient } from "./github/client.js";
import { FetchNotificationsTask } from "./tasks/fetch-notifications.ts";
import { type Logger } from "./utils/logger.ts";

const kTaskRunnerInterval = 3 * 60 * 1000; // 3 minutes

export const kTaskRunnerType = "task-runner";

export class TaskRunner {
  #db: Prisma;
  #timer: NodeJS.Timeout | null = null;
  #logger: Logger;

  constructor(db: Prisma, logger: Logger) {
    this.#db = db;
    this.#logger = logger.child({ name: "task-runner" });
  }

  close() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }

  async schedule() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }

    const endpoints = await this.#db.instance.endpoint.findMany();
    const lastRuns = await Promise.all(
      endpoints.map(async (endpoint) => {
        const lastRun = await this.#db.instance.task.findFirst({
          where: { type: kTaskRunnerType, endpoint_id: endpoint.id },
          orderBy: { last_run: "desc" },
        });
        return lastRun?.last_run.getTime() ?? 0;
      }),
    );
    const minLastRun = Math.min(...lastRuns);
    const nextRunDelay = Math.max(
      kTaskRunnerInterval - (Date.now() - minLastRun),
      0,
    );

    this.#timer = setTimeout(() => {
      this.run();
    }, nextRunDelay);
    this.#logger.info(`TaskRunner scheduled to run in ${nextRunDelay} ms.`);
  }

  private reschedule() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }

    this.#timer = setTimeout(() => {
      this.run();
    }, kTaskRunnerInterval);
    this.#logger.info(
      `TaskRunner scheduled next run in ${kTaskRunnerInterval} ms.`,
    );
  }

  private async run() {
    this.#logger.info("TaskRunner started.");
    const outdatedEndpoints = await this.findOutdatedEndpoints();
    if (outdatedEndpoints.length === 0) {
      this.#logger.info(
        "No outdated endpoints found. TaskRunner will not run.",
      );
      this.reschedule(); // Reschedule
      return;
    }
    for (const endpoint of outdatedEndpoints) {
      try {
        await this.runForEndpoint(endpoint);
      } catch (error) {
        this.#logger.error(
          `Error running TaskRunner for endpoint ${endpoint.id}:`,
          error,
        );
      }
    }
    this.#logger.info("TaskRunner completed.");
    this.reschedule(); // Reschedule after running
  }

  private async findOutdatedEndpoints(): Promise<Endpoint[]> {
    const endpoints = await this.#db.instance.endpoint.findMany();
    const outdatedEndpoints: Endpoint[] = [];
    for (const endpoint of endpoints) {
      const lastRun = await this.#db.instance.task.findFirst({
        where: { type: kTaskRunnerType, endpoint_id: endpoint.id },
        orderBy: { last_run: "desc" },
      });
      if (
        !lastRun ||
        Date.now() - lastRun.last_run.getTime() > kTaskRunnerInterval
      ) {
        outdatedEndpoints.push(endpoint);
      }
    }
    return outdatedEndpoints;
  }

  async runForEndpoint(endpoint: Endpoint, since?: Date) {
    this.#logger.info("Running for endpoint %s since %s", endpoint.id, since);
    // TODO: optimize last run info.
    if (since == null) {
      const task = await this.#db.instance.task.findFirst({
        where: { type: kTaskRunnerType, endpoint_id: endpoint.id },
      });
      since = task?.last_run;
    }

    await this.runTasksForEndpoint(endpoint, since);
    this.#logger.info(`TaskRunner completed for endpoint ${endpoint.id}.`);

    // TODO: optimize task info.
    const now = new Date();
    const task = await this.#db.instance.task.findFirst({
      where: { type: kTaskRunnerType, endpoint_id: endpoint.id },
    });
    if (task == null) {
      await this.#db.instance.task.create({
        data: {
          type: kTaskRunnerType,
          endpoint_id: endpoint.id,
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
  }

  private async runTasksForEndpoint(endpoint: Endpoint, since?: Date) {
    this.#logger.info(`Running tasks for endpoint ${endpoint.id}...`);
    const gh = new GitHubClient(
      endpoint.url,
      endpoint.token,
      endpoint.proxy_url,
    );

    try {
      const task = new FetchNotificationsTask(
        this.#db,
        gh,
        endpoint.id,
        this.#logger,
        since,
      );
      await task.run();
    } catch (error) {
      this.#logger.error(
        `Error running task for endpoint ${endpoint.id}:`,
        error,
      );
    }
  }
}
