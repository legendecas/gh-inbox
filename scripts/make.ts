import { build, buildApp } from "./build-scripts.ts";
import { $ } from "./zx.ts";

await build();
await buildApp();

await $`electron-forge make`;
