import { $ } from "zx";
import { resolve } from "node:path";

process.env.PATH = `${process.cwd()}/node_modules/.bin:${process.env.PATH}`;
const kProjectRoot = resolve(import.meta.dirname, "..");
process.chdir(kProjectRoot);

await $`cat package.json | grep name`;

await $`prisma generate`;

await $`tsc --build .`;

await $`npx @tailwindcss/cli -i ./src/app/index.css -o ./dist/app/index.css`;

await $`cp ./src/app/index.html ./dist/app/index.html`;
await $`cp -R ./src/generated ./dist/generated`;
await $`mkdir -p ./dist/prisma`;
await $`cp -R ./src/prisma/migrations ./dist/prisma/`;
