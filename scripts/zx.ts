import { $, cd } from "zx";
import { resolve } from "node:path";

export const kProjectRoot = resolve(import.meta.dirname, "..");

$.verbose = true;
$.env.PATH = `${process.cwd()}/node_modules/.bin:${$.env.PATH}`;

export { $ };
export function chdir(path: string, root: string = kProjectRoot) {
  const currentDir = $.cwd ?? kProjectRoot;
  const dir = resolve(root, path);
  cd(dir);
  return {
    [Symbol.dispose]() {
      cd(currentDir);
    },
  };
}
