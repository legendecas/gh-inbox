import type { Prisma } from "../database/prisma.ts";
import type { IpcHandle, IService } from "../service-manager.ts";
import type {
  RepoInfo,
  RepoNamespace,
  ReposEndpoint,
} from "../../common/ipc/repos.ts";

export class ReposService implements IService, ReposEndpoint {
  namespace = "repos";

  #db: Prisma;
  constructor(db: Prisma) {
    this.#db = db;
  }

  wire(ipcHandle: IpcHandle) {
    ipcHandle.wire("list", this.list);
  }

  async list() {
    const repos = await this.#db.instance.repository.findMany({
      orderBy: { full_name: "asc" },
    });

    const repoInfos: RepoInfo[] = await Promise.all(
      repos.map((repo) => {
        return this.#db.instance.thread
          .count({
            where: { repository_id: repo.id, archived: false, unread: true },
          })
          .then((unreadCount) => ({
            ...repo,
            unread_count: unreadCount,
          }));
      }),
    );

    const namespaces = repoInfos.reduce((acc, repo) => {
      const owner = ownerFromFullName(repo.full_name);
      const namespace = acc.get(owner);
      if (namespace) {
        namespace.repos.push(repo);
      } else {
        acc.set(owner, { owner, repos: [repo] });
      }
      return acc;
    }, new Map<string, RepoNamespace>());

    return Array.from(namespaces.values());
  }
}

function ownerFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[0] : "";
}
