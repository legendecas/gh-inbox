import { $, chdir } from "./zx.ts";

export async function build() {
  await $`prisma generate`;

  await $`tsc --build .`;

  await $`rm -rf ./dist/generated`;
  await $`cp -R ./src/generated ./dist/`;

  await $`rm -rf ./dist/prisma`;
  await $`mkdir -p ./dist/prisma`;
  await $`cp -R ./src/prisma/migrations ./dist/prisma/`;
}

export async function buildApp() {
  using _dir = chdir("src/app");
  await $`vite build -c vite.config.ts \
    --mode production \
    --outDir ../../dist/app \
    --sourcemap inline \
    --emptyOutDir \
    --base ./
  `;
}

export async function serveApp(port: number) {
  using _dir = chdir("src/app");
  await $`vite -c vite.config.ts \
    --host 127.0.0.1 \
    --port ${port} \
    --strictPort
  `;
}
