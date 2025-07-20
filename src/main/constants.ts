import { resolve } from "node:path";

export const kMainDir = import.meta.dirname;
export const kRootDir = resolve(kMainDir, "..");
export const kAppDir = resolve(kRootDir, "./app");
export const kPreloadDir = resolve(kRootDir, "./preload");
export const kStaticDir = resolve(kRootDir, "./static");
export const kPrismaDir = resolve(kRootDir, "./prisma");
