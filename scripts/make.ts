import { $ } from "./zx.ts";
import { build, buildApp } from "./build-scripts.ts";

await build();
await buildApp();

await $`electron-forge make`;
