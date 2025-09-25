import type { Repository, SavedSearch } from "../../generated/prisma/index";

export interface FilterListOptions {
  endpointId: number;
}

export interface RepoInfo extends Repository {
  unread_count: number;
  inbox_count: number;
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

export interface SearchPreview {
  id: number;
  type: string;
  leading_visual: string;
  name: string;
  query: string;
  count: number;
}

export interface ListResult {
  presetFilters: PresetFilter[];
  searches: SearchPreview[];
  repoNamespaces: RepoNamespace[];
}

export interface CreateSearchOptions {
  type: string;
  sort_weight: number;
  leading_visual: string;
  name: string;
  query: string;
  description?: string;
  endpoint_id: number;
}

export interface PresetFilterEndpoint {
  list: (options: FilterListOptions) => Promise<ListResult>;

  listSearches(endpointId: number): Promise<SavedSearch[]>;
  createSearch(search: CreateSearchOptions): Promise<void>;
  updateSearch(id: number, search: CreateSearchOptions): Promise<void>;
  deleteSearch(id: number): Promise<void>;
}
