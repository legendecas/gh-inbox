import { $ } from "./zx.ts";
import { build, serveApp } from './build-scripts.ts';

const kPort = 4567;
$.env.NODE_ENV = "development";
$.env.GH_INBOX_SERVER_PORT = `${kPort}`;
await build();
const serveAppFuture = serveApp(kPort);
const electronFuture = $`electron-forge start`

await Promise.all([serveAppFuture, electronFuture]);
