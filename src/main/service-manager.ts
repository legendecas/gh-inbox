import { type Logger } from "./utils/logger.ts";

export class ServiceManager {
  #services: Map<string, IService>;
  #logger: Logger;

  constructor(logger: Logger) {
    this.#services = new Map();
    this.#logger = logger;
  }

  registerService(service: IService) {
    const name = service.constructor.name;
    if (this.#services.has(name)) {
      throw new Error(`Service ${name} is already registered.`);
    }
    this.#services.set(name, service);
  }

  wireAll(ipcMain: Electron.IpcMain) {
    for (const service of this.#services.values()) {
      const ipcHandle = new IpcHandle(ipcMain, service, this.#logger);
      service.wire(ipcHandle);
    }
  }
}

export interface IService {
  namespace: string;
  wire(ipcHandle: IpcHandle): void;
}

export class IpcHandle {
  #ipcMain: Electron.IpcMain;
  #service: IService;
  #logger: Logger;

  constructor(ipcMain: Electron.IpcMain, service: IService, logger: Logger) {
    this.#ipcMain = ipcMain;
    this.#service = service;
    this.#logger = logger.child({
      name: `ipc-handle`,
      service: service.namespace,
    });
  }

  wire(channel: string, listener: (...args: any[]) => Promise<unknown>) {
    this.#ipcMain.handle(
      `${this.#service.namespace}:${channel}`,
      async (_event: Electron.IpcMainInvokeEvent, ...args: unknown[]) => {
        try {
          return await listener.apply(this.#service, args);
        } catch (error) {
          this.#logger.error(
            `Error handling IPC message ${channel}: %s`,
            error,
          );
          throw error;
        }
      },
    );
  }
}
