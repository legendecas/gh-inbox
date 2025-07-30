import { BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { Migrator } from "./database/migrator.ts";
import { Prisma } from "./database/prisma.js";
import { GitHubClient } from "./github/client.js";
import { ServiceManager } from "./service-manager.ts";
import { ThreadsService } from "./services/threads.ts";
import { logger } from "./utils/logger.ts";
import { kAppDir, kPreloadDir } from "./constants.ts";
import { PresetFilterService } from "./services/preset-filter.ts";
import { TaskRunner } from "./task-runner.ts";
import { EndpointService } from "./services/endpoint.ts";

export class Application {
  #db!: Prisma;
  #gh!: GitHubClient;
  #taskRunner!: TaskRunner;
  #mainWindow?: BrowserWindow;

  async onReady() {
    const databasePath = path.join(process.cwd(), "prisma.db");
    await using migrator = new Migrator(databasePath);
    await migrator.runMigrations();

    this.#db = new Prisma(databasePath);
    this.#gh = new GitHubClient(
      "https://api.github.com",
      process.env.GITHUB_TOKEN || "",
    );

    this.#taskRunner = new TaskRunner(this.#db, this.#gh);
    await this.#taskRunner.schedule();

    const serviceManager = new ServiceManager();
    serviceManager.registerService(new ThreadsService(this.#db));
    serviceManager.registerService(new PresetFilterService(this.#db));
    serviceManager.registerService(new EndpointService(this.#db));
    serviceManager.wireAll(ipcMain);
  }

  async onQuit() {
    await this.#db.close();
    logger.log("Application exited gracefully.");
  }

  createMainWindow() {
    if (this.#mainWindow) {
      logger.log("Main window already exists, skipping creation.");
      return;
    }

    logger.log("Creating main window", kAppDir);

    this.#mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(kPreloadDir, "preload.js"),
      },
    });

    if (process.env.GH_INBOX_SERVER_PORT) {
      logger.log(
        "Using GH_INBOX_SERVER_PORT:",
        process.env.GH_INBOX_SERVER_PORT,
      );
      this.#mainWindow.loadURL(
        `http://localhost:${process.env.GH_INBOX_SERVER_PORT}`,
      );
    } else {
      this.#mainWindow.loadFile(path.join(kAppDir, "index.html"));
    }

    this.#mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    this.#mainWindow.on("close", () => {
      logger.info("Main window closed.");
      this.#mainWindow = undefined;
    });
  }

  async loadDevTools() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    const { default: installer } = await import("electron-devtools-installer");
    await installer.installExtension(installer.REACT_DEVELOPER_TOOLS);
  }
}
