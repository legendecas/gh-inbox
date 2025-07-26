export interface Logger {
  log: (format: string, ...args: unknown[]) => void;
  info: (format: string, ...args: unknown[]) => void;
  warn: (format: string, ...args: unknown[]) => void;
  error: (format: string, ...args: unknown[]) => void;
}

export const logger: Logger = console;
