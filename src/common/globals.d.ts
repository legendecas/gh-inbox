import type { URL as _URL } from "node:url";

declare global {
  var URL: typeof _URL;
}
