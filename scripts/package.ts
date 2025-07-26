import { $ } from "./zx.ts";
import { build, buildApp } from './build-scripts';

await build();
await buildApp();

await $`electron-forge package`;
