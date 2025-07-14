export {};

declare global {
  var versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
    ping: () => Promise<string>;
  };
}
