import { app, BrowserWindow } from "electron";
import path from "node:path";
import { kAppDir, kPreloadDir } from "./constants.ts";
import { Application } from "./application.ts";

const instance = new Application();

function createWindow() {
  console.log("Creating main window", kAppDir);

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(kPreloadDir, "preload.js"),
    },
  });

  win.loadFile(path.join(kAppDir, "index.html"));
}

app.whenReady().then(async () => {
  await instance.onReady();

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

app.on("before-quit", async () => {
  await instance.onQuit();
});
