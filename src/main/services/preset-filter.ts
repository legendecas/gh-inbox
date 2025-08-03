import type { Prisma } from "../database/prisma.ts";
import type { IpcHandle, IService } from "../service-manager.ts";
import type {
  RepoInfo,
  RepoNamespace,
  PresetFilterEndpoint,
  PresetFilter,
  FilterListOptions,
} from "../../common/ipc/preset-filter.ts";
import { kPresetFilterQueries } from "../../common/presets.ts";

export class PresetFilterService implements IService, PresetFilterEndpoint {
  namespace = "presetFilter";

  #db: Prisma;
  constructor(db: Prisma) {
    this.#db = db;
  }

  wire(ipcHandle: IpcHandle) {
    ipcHandle.wire("list", this.list);
  }

  async list(options: FilterListOptions) {
    return {
      presetFilters: await this.listPresetFilters(options),
      repoNamespaces: await this.listRepos(options),
    };
  }

  private async listPresetFilters(
    options: FilterListOptions,
  ): Promise<PresetFilter[]> {
    return Promise.all(
      Object.entries(kPresetFilterQueries).map(async ([type, filter]) => ({
        type,
        unread_count: await this.#db.instance.thread.count({
          where: {
            AND: [{ endpoint_id: options.endpointId }, filter],
          },
        }),
      })),
    );
  }

  private async listRepos(
    options: FilterListOptions,
  ): Promise<RepoNamespace[]> {
    const repos = await this.#db.instance.repository.findMany({
      where: { endpoint_id: options.endpointId },
      orderBy: { full_name: "asc" },
    });

    const repoInfos: RepoInfo[] = await Promise.all(
      repos.map((repo) => {
        return this.#db.instance.thread
          .count({
            where: {
              endpoint_id: options.endpointId,
              repository_id: repo.id,
              archived: false,
              unread: true,
            },
          })
          .then((unreadCount) => ({
            ...repo,
            unread_count: unreadCount,
          }));
      }),
    );

    const namespaces = new Map<string, RepoNamespace>();
    for (const repo of repoInfos) {
      const ownerFullName = ownerFromFullName(repo.full_name);
      const namespace = namespaces.get(ownerFullName);
      if (namespace) {
        namespace.repos.push(repo);
      } else {
        const owner = await this.#db.instance.owner.findUnique({
          where: { endpoint_id: options.endpointId, id: repo.owner_id },
        });
        if (owner == null) continue; // Skip if owner not found
        namespaces.set(ownerFullName, {
          owner: ownerFullName,
          avatar_url: owner.avatar_url,
          repos: [repo],
        });
      }
    }

    return Array.from(namespaces.values());
  }
}

function ownerFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[0] : "";
}
