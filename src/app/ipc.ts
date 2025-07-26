import type {
  IpcEndpointParameters,
  IpcEndpointReturnType,
  IpcEndpoints,
} from "../common/ipc/ipc";

export {};

declare global {
  var versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
  };
  var ipc: {
    invoke<
      Namespace extends keyof IpcEndpoints,
      Channel extends keyof IpcEndpoints[Namespace],
    >(
      namespace: Namespace,
      channel: Channel,
      ...args: IpcEndpointParameters<Namespace, Channel>
    ): Promise<IpcEndpointReturnType<Namespace, Channel>>;
  };
}
