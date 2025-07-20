import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const kMainDir = resolve(fileURLToPath(import.meta.url), "../..");
export const kAppDir = resolve(kMainDir, "./app");
export const kStaticDir = resolve(kMainDir, "./static");
export const kPrismaDir = resolve(kMainDir, "./prisma");
