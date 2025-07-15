import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { kAppDir } from "./constants.ts";

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
}

app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
