import { BrowserWindow, app } from "electron";

import { Application } from "./application.ts";

const instance = new Application();

app.whenReady().then(async () => {
  await instance.onReady();

  await instance.loadDevTools();
  instance.createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      instance.createMainWindow();
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

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception: %s", error);
  instance.logger.error("Uncaught Exception: %s", error);
});
