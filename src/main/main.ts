import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { kAppDir } from "./constants.ts";
import { Migrator } from "./database/migrator.ts";
import { Prisma } from "./database/prisma.ts";

async function test() {
  const databasePath = path.join(process.cwd(), "prisma.db");
  await using migrator = new Migrator(databasePath);
  await migrator.runMigrations();

  await using db = new Prisma(databasePath);
  await db.instance.label.create({
    data: {
      id: crypto.randomUUID(),
      name: "Test Label",
      color: "#FF5733",
      description: "This is a test label",
      url: "https://example.com",
    },
  });

  const labels = await db.instance.label.findMany();
  console.log("Labels in database:", labels);
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
