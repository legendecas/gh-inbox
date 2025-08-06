import { BrowserWindow, app, ipcMain, shell } from "electron";
import path from "node:path";

import { kAppDir, kPreloadDir } from "./constants.ts";
import { Migrator } from "./database/migrator.ts";
import { Prisma } from "./database/prisma.js";
import { ServiceManager } from "./service-manager.ts";
import { EndpointService } from "./services/endpoint.ts";
import { PresetFilterService } from "./services/preset-filter.ts";
import { ThreadsService } from "./services/threads.ts";
import { TaskRunner } from "./task-runner.ts";
import { type Logger, flushLogger, initializeLogger } from "./utils/logger.ts";

export class Application {
  #db!: Prisma;
  #taskRunner!: TaskRunner;
  #mainWindow?: BrowserWindow;
  #logger!: Logger;

  get taskRunner() {
    return this.#taskRunner;
  }

  get logger() {
    return this.#logger;
  }

  async onReady() {
    this.#logger = initializeLogger(app.getPath("logs"));
    this.#logger.info("Application is starting...");

    const userDataPath = app.getPath("userData");

    const databasePath = path.join(userDataPath, "gh-inbox.db");
    {
      await using migrator = new Migrator(databasePath, this.#logger);
      await migrator.runMigrations().catch((error) => {
        console.error("Failed to run migrations:", error);
      });
    }

    this.#db = new Prisma(databasePath);

    this.#taskRunner = new TaskRunner(this.#db, this.#logger);
    await this.#taskRunner.schedule();

    const serviceManager = new ServiceManager(this.#logger);
    serviceManager.registerService(new ThreadsService(this.#db));
    serviceManager.registerService(new PresetFilterService(this.#db));
    serviceManager.registerService(new EndpointService(this, this.#db));
    serviceManager.wireAll(ipcMain);
  }

  async onQuit() {
    this.#logger.info("Application is quitting...");
    this.#taskRunner.close();
    await this.#db.close();
    flushLogger();
  }

  createMainWindow() {
    if (this.#mainWindow) {
      this.#logger.info("Main window already exists, skipping creation.");
      return;
    }

    this.#logger.info("Creating main window %s", kAppDir);

    this.#mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(kPreloadDir, "preload.js"),
      },
    });

    if (process.env.GH_INBOX_SERVER_PORT) {
      this.#logger.info(
        "Using GH_INBOX_SERVER_PORT: %s",
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
      this.#mainWindow = undefined;
    });
  }

  async loadDevTools() {
    if (process.env.NODE_ENV !== "development") {
      this.#logger.info("Skipping dev tools loading in production mode.");
      return;
    }
    const { default: installer } = await import("electron-devtools-installer");
    await installer.installExtension(installer.REACT_DEVELOPER_TOOLS);
  }
}
