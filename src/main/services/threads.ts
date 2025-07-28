import { kStateType, type StateType } from "../../common/github-constants.ts";
import type { ThreadEndpoint, ThreadItem } from "../../common/ipc/threads.ts";
import { parseStringListStr } from "../../common/string-list.ts";
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
    const threadItems: ThreadItem[] = await Promise.all(
      threads.map(async (thread) => {
        const subject = await this.#db.instance.subject.findFirst({
          where: {
            number: thread.subject_number,
            repository_id: thread.repository_id,
          },
        });
        const labels =
          subject == null
            ? []
            : await this.#db.instance.label.findMany({
                where: { id: { in: parseStringListStr(subject.labels) } },
              });
        const state = (
          subject?.merged === true
            ? kStateType.merged
            : subject?.is_draft === true
              ? kStateType.draft
              : (subject?.state ?? kStateType.open)
        ) as StateType;

        return {
          ...thread,
          state,
          labels,
          html_url: subject?.html_url ?? "",
        };
      }),
    );
    return threadItems;
  }
}
