import { $ } from "./zx.ts";
import { build, serveApp } from "./build-scripts.ts";

const kPort = 4567;
$.env.NODE_OPTIONS = "--enable-source-maps";
$.env.NODE_ENV = "development";
$.env.GH_INBOX_SERVER_PORT = `${kPort}`;
await build();
const controller = new AbortController();
const serveAppFuture = serveApp(kPort, controller.signal);
const electronFuture = $`electron-forge start`.then(() => {
  controller.abort();
});

await Promise.all([serveAppFuture, electronFuture]);
