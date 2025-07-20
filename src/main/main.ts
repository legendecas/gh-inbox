import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { kAppDir } from "./constants.ts";
import { Migrator } from "./database/migrator.ts";
import { Prisma } from "./database/prisma.ts";
import { GitHubClient } from "./github/client.ts";
import { FetchNotificationsTask } from "./tasks/fetch-notifications.ts";

async function test() {
  const databasePath = path.join(process.cwd(), "prisma.db");
  await using migrator = new Migrator(databasePath);
  await migrator.runMigrations();

  await using db = new Prisma(databasePath);

  const gh = new GitHubClient(
    "https://api.github.com",
    process.env.GITHUB_TOKEN || "",
  );
  const task = new FetchNotificationsTask(db, gh);
  await task.run();
}

function createWindow() {
  console.log("Creating main window", kAppDir);

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(kAppDir, "preload.js"),
    },
  });

  win.loadFile(path.join(kAppDir, "index.html"));

  test().catch((error) => {
    console.error("Error during test:", error);
  });
}

app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
