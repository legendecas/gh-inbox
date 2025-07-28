import type { ReposEndpoint } from "./repos";
import type { ShellEndpoint } from "./shell";
import type { ThreadEndpoint } from "./threads";

export interface IpcEndpoints {
  threads: ThreadEndpoint;
  repos: ReposEndpoint;
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
