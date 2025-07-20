export {};

declare global {
  var versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
  };
  var ipc: {
    invoke: (
      namespace: string,
      channel: string,
      ...args: unknown[]
    ) => Promise<unknown>;
  };
}
