import type { Repository } from "../../generated/prisma/index";

export interface FilterListOptions {
  endpointId: number;
}

export interface RepoInfo extends Repository {
  unread_count: number;
}

export interface RepoNamespace {
  owner: string;
  avatar_url: string;
  repos: RepoInfo[];
}

export interface PresetFilter {
  type: string;
  unread_count: number;
}

export interface ListResult {
  presetFilters: PresetFilter[];
  repoNamespaces: RepoNamespace[];
}

export interface PresetFilterEndpoint {
  list: (options: FilterListOptions) => Promise<ListResult>;
}
