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
import { logger } from "./utils/logger.ts";

export class Application {
  #db!: Prisma;
  #taskRunner!: TaskRunner;
  #mainWindow?: BrowserWindow;

  async onReady() {
    const userDataPath = app.getPath("userData");

    const databasePath = path.join(userDataPath, "gh-inbox.db");
    await using migrator = new Migrator(databasePath);
    await migrator.runMigrations();

    this.#db = new Prisma(databasePath);

    this.#taskRunner = new TaskRunner(this.#db);
    await this.#taskRunner.schedule();

    const serviceManager = new ServiceManager();
    serviceManager.registerService(new ThreadsService(this.#db));
    serviceManager.registerService(new PresetFilterService(this.#db));
    serviceManager.registerService(new EndpointService(this, this.#db));
    serviceManager.wireAll(ipcMain);
  }

  get taskRunner() {
    return this.#taskRunner;
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
      logger.info("Skipping dev tools loading in production mode.");
      return;
    }
    const { default: installer } = await import("electron-devtools-installer");
    await installer.installExtension(installer.REACT_DEVELOPER_TOOLS);
  }
}
