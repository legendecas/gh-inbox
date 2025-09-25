import type {
  CreateSearchOptions,
  FilterListOptions,
  PresetFilter,
  PresetFilterEndpoint,
  RepoInfo,
  RepoNamespace,
  SearchPreview,
} from "../../common/ipc/preset-filter.ts";
import { kPresetFilterSearches } from "../../common/presets.ts";
import { FilterBuilder } from "../../common/search-builder/filter-builder.ts";
import { SearchParser } from "../../common/search-builder/search-parser.ts";
import type { SavedSearch } from "../../generated/prisma/index.js";
import type { Prisma } from "../database/prisma.ts";
import type { IService, IpcHandle } from "../service-manager.ts";

export class PresetFilterService implements IService, PresetFilterEndpoint {
  namespace = "presetFilter";

  #db: Prisma;
  #presetQueries;
  constructor(db: Prisma) {
    this.#db = db;
    this.#presetQueries = Object.entries(kPresetFilterSearches).map(
      ([type, search]) => {
        const parsedQuery = new SearchParser().parse(search);
        const filter = new FilterBuilder().fromRecord(parsedQuery).build();
        return [type, filter] as const;
      },
    );
  }

  wire(ipcHandle: IpcHandle) {
    ipcHandle.wire("list", this.list);
    ipcHandle.wire("listSearches", this.listSearches);
    ipcHandle.wire("createSearch", this.createSearch);
    ipcHandle.wire("updateSearch", this.updateSearch);
    ipcHandle.wire("deleteSearch", this.deleteSearch);
  }

  async list(options: FilterListOptions) {
    return {
      presetFilters: await this.listPresetFilters(options),
      searches: await this.listSearchPreviews(options),
      repoNamespaces: await this.listRepos(options),
    };
  }

  private async listPresetFilters(
    options: FilterListOptions,
  ): Promise<PresetFilter[]> {
    return Promise.all(
      this.#presetQueries.map(async ([type, filter]) => ({
        type,
        unread_count: await this.#db.instance.thread.count({
          where: {
            AND: [{ endpoint_id: options.endpointId }, filter],
          },
        }),
      })),
    );
  }

  private async listSearchPreviews(
    options: FilterListOptions,
  ): Promise<SearchPreview[]> {
    const searches = await this.#db.instance.savedSearch.findMany({
      where: { endpoint_id: options.endpointId },
      orderBy: { sort_weight: "asc" },
    });

    const previews = await Promise.all(
      searches.map(async (search) => {
        const parsedSearch = new SearchParser().parse(search.query);
        const filter = new FilterBuilder().fromRecord(parsedSearch).build();

        const count = await this.#db.instance.thread.count({
          where: {
            AND: [{ endpoint_id: options.endpointId }, filter],
          },
        });

        return {
          id: search.id,
          type: search.type,
          leading_visual: search.leading_visual,
          name: search.name,
          query: search.query,
          count,
        };
      }),
    );

    return previews;
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
        return Promise.all([
          this.#db.instance.thread.count({
            where: {
              endpoint_id: options.endpointId,
              repository_id: repo.id,
              archived: false,
              unread: true,
            },
          }),
          this.#db.instance.thread.count({
            where: {
              endpoint_id: options.endpointId,
              repository_id: repo.id,
              archived: false,
            },
          }),
        ]).then(([unreadCount, inboxCount]) => ({
          ...repo,
          unread_count: unreadCount,
          inbox_count: inboxCount,
        }));
      }),
    );

    const namespaces = new Map<string, RepoNamespace>();
    for (const repo of repoInfos) {
      if (repo.inbox_count === 0) continue; // Skip repos with zero inbox count

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

  async listSearches(endpointId: number): Promise<SavedSearch[]> {
    return this.#db.instance.savedSearch.findMany({
      where: { endpoint_id: endpointId },
      orderBy: { sort_weight: "asc" },
    });
  }

  async createSearch(search: CreateSearchOptions): Promise<void> {
    await this.#db.instance.savedSearch.create({
      data: {
        ...search,
        endpoint_id: search.endpoint_id,
      },
    });
  }

  async updateSearch(id: number, search: CreateSearchOptions): Promise<void> {
    await this.#db.instance.savedSearch.update({
      where: { id },
      data: {
        ...search,
        endpoint_id: search.endpoint_id,
      },
    });
  }

  async deleteSearch(id: number): Promise<void> {
    await this.#db.instance.savedSearch.delete({
      where: { id },
    });
  }
}

function ownerFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[0] : "";
}
