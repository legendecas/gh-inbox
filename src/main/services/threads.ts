import { kStateType, type StateType } from "../../common/github-constants.ts";
import type {
  ThreadEndpoint,
  ThreadItem,
  ThreadListOptions,
} from "../../common/ipc/threads.ts";
import { kPageSize, type ThreadFilter } from "../../common/presets.ts";
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
    ipcHandle.wire("archive", this.archive);
  }

  async list(options: ThreadListOptions) {
    const filter: ThreadFilter = {
      AND: [
        { endpoint_id: options.endpointId },
        options.filter ?? { archived: false },
      ],
    };

    const count = await this.#db.instance.thread.count({
      where: filter,
    });
    const threads = await this.#db.instance.thread.findMany({
      where: filter,
      orderBy: { updated_at: "desc" },
      skip: ((options.page ?? 1) - 1) * (options.pageSize ?? kPageSize),
      take: options.pageSize ?? kPageSize,
    });
    const threadItems: ThreadItem[] = await Promise.all(
      threads.map(async (thread) => {
        const subject = await this.#db.instance.subject.findFirst({
          where: {
            endpoint_id: options.endpointId,
            number: thread.subject_number,
            repository_id: thread.repository_id,
          },
        });
        const labels =
          subject == null
            ? []
            : await this.#db.instance.label.findMany({
                where: {
                  endpoint_id: options.endpointId,
                  id: { in: parseStringListStr(subject.labels) },
                },
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
    return {
      totalCount: count,
      threads: threadItems,
    };
  }

  async archive(endpointId: number, threads: string[]) {
    await this.#db.instance.thread.updateMany({
      where: { endpoint_id: endpointId, id: { in: threads } },
      data: { archived: true, archived_at: new Date() },
    });
  }
}
