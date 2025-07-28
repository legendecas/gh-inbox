export interface ShellEndpoint {
  openUrl: (url: string) => Promise<void>;
}
