import type { EndpointEndpoint } from "./endpoint";
import type { PresetFilterEndpoint } from "./preset-filter";
import type { ShellEndpoint } from "./shell";
import type { ThreadEndpoint } from "./threads";

export interface IpcEndpoints {
  endpoint: EndpointEndpoint;
  threads: ThreadEndpoint;
  presetFilter: PresetFilterEndpoint;
  shell: ShellEndpoint;
}

export type IpcEndpointParameters<
  Namespace extends keyof IpcEndpoints,
  Channel extends keyof IpcEndpoints[Namespace],
> = IpcEndpoints[Namespace][Channel] extends (...args: infer P) => any
  ? P
  : never;

export type IpcEndpointReturnType<
  Namespace extends keyof IpcEndpoints,
  Channel extends keyof IpcEndpoints[Namespace],
> = IpcEndpoints[Namespace][Channel] extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : never;
