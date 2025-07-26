import type { ThreadEndpoint } from "../../common/ipc/threads.ts";
import type { Prisma } from "../database/prisma.ts";
import type { IpcHandle, IService } from "../service-manager.ts";

export class ThreadsService implements IService, ThreadEndpoint {
  namespace = "threads";

  #db: Prisma;
  constructor(db: Prisma) {
    this.#db = db;
  }

  wire(ipcHandle: IpcHandle) {
    ipcHandle.wire("list", this.list);
  }

  async list() {
    const threads = await this.#db.instance.thread.findMany({
      where: { archived: false },
      orderBy: { updated_at: "desc" },
    });
    return threads;
  }
}
