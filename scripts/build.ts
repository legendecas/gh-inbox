import { $, cd } from "zx";
import { resolve } from "node:path";

const kProjectRoot = resolve(import.meta.dirname, "..");

$.verbose = true;
$.env.PATH = `${process.cwd()}/node_modules/.bin:${$.env.PATH}`;
using _dir = chdir(kProjectRoot);

await $`prisma generate`;

await $`tsc --build .`;

{
  using _dir = chdir(resolve(kProjectRoot, "src/app"));
  await $`vite build -c vite.config.ts \
    --mode production \
    --outDir ../../dist/app \
    --sourcemap inline \
    --emptyOutDir \
    --base ./
  `;
}

await $`rm -rf ./dist/generated`;
await $`cp -R ./src/generated ./dist/`;

await $`rm -rf ./dist/prisma`;
await $`mkdir -p ./dist/prisma`;
await $`cp -R ./src/prisma/migrations ./dist/prisma/`;

function chdir(path: string) {
  const currentDir = $.cwd ?? kProjectRoot;
  cd(path);
  return {
    [Symbol.dispose]() {
      cd(currentDir);
    },
  };
}
