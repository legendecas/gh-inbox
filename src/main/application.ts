import { ipcMain } from "electron";
import path from "node:path";
import { Migrator } from "./database/migrator.ts";
import { Prisma } from "./database/prisma.js";
import { GitHubClient } from "./github/client.js";
import { FetchNotificationsTask } from "./tasks/fetch-notifications.ts";
import { ServiceManager } from "./service-manager.ts";
import { ThreadsService } from "./services/threads.ts";

export class Application {
  #db!: Prisma;
  #gh!: GitHubClient;

  async onReady() {
    const databasePath = path.join(process.cwd(), "prisma.db");
    await using migrator = new Migrator(databasePath);
    await migrator.runMigrations();

    this.#db = new Prisma(databasePath);
    this.#gh = new GitHubClient(
      "https://api.github.com",
      process.env.GITHUB_TOKEN || "",
    );

    const task = new FetchNotificationsTask(this.#db, this.#gh);
    await task.run();

    const serviceManager = new ServiceManager();
    serviceManager.registerService(new ThreadsService(this.#db));
    serviceManager.wireAll(ipcMain);
  }

  async onQuit() {
    await this.#db.close();
    console.log("Application exited gracefully.");
  }
}
