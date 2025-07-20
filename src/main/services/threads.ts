import type { Prisma } from "../database/prisma.ts";
import type { IpcHandle, IService } from "../service-manager.ts";

export class ThreadsService implements IService {
  namespace = "threads";

  #db: Prisma;
  constructor(db: Prisma) {
    this.#db = db;
  }

  wire(ipcHandle: IpcHandle) {
    ipcHandle.wire("list", this.listThreads);
  }

  async listThreads() {
    const threads = await this.#db.instance.thread.findMany({
      where: { archived: false },
    });
    return threads;
  }
}
