export class ServiceManager {
  #services: Map<string, IService>;

  constructor() {
    this.#services = new Map();
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
      const ipcHandle = new IpcHandle(ipcMain, service);
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

  constructor(ipcMain: Electron.IpcMain, service: IService) {
    this.#ipcMain = ipcMain;
    this.#service = service;
  }

  wire(channel: string, listener: (...args: unknown[]) => Promise<unknown>) {
    this.#ipcMain.handle(
      `${this.#service.namespace}:${channel}`,
      async (_event: Electron.IpcMainInvokeEvent, ...args: unknown[]) => {
        try {
          return await listener.apply(this.#service, args);
        } catch (error) {
          console.error(`Error handling IPC message ${channel}:`, error);
        }
      },
    );
  }
}
