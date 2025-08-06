import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export interface Logger {
  info: (format: string, ...args: unknown[]) => void;
  warn: (format: string, ...args: unknown[]) => void;
  error: (format: string, ...args: unknown[]) => void;

  child: (meta: Record<string, string>) => Logger;
}

export class ConsoleLogger implements Logger {
  private readonly meta: Record<string, string>;
  constructor(meta: Record<string, string>) {
    this.meta = meta;
  }

  info(format: string, ...args: unknown[]): void {
    console.info(`[${this.meta.name}] ${format}`, ...args);
  }

  warn(format: string, ...args: unknown[]): void {
    console.warn(`[${this.meta.name}] ${format}`, ...args);
  }

  error(format: string, ...args: unknown[]): void {
    console.error(`[${this.meta.name}] ${format}`, ...args);
  }

  child(meta: Record<string, string>): Logger {
    return new ConsoleLogger({ ...this.meta, ...meta });
  }
}

let logger: winston.Logger | null = null;
export function initializeLogger(logdir: string) {
  const transports: winston.transport[] = [
    new DailyRotateFile({
      level: "info",
      dirname: logdir,
      filename: "gh-inbox-%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: false,
      maxSize: "20m",
      maxFiles: "3d",
      format: winston.format.json(),
    }),
  ];

  if (process.env.NODE_ENV !== "production") {
    transports.push(
      new winston.transports.Console({
        format: winston.format.cli(),
      }),
    );
  }

  const winstonLogger = winston.createLogger({
    level: "info",
    transports,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.splat(),
    ),
  });
  logger = winstonLogger;

  return winstonLogger;
}

export function flushLogger() {
  if (logger) {
    logger.end();
    logger = null;
  }
}
