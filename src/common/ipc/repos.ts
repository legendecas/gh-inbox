import type { Repository } from "../../generated/prisma/index.ts";

export interface RepoInfo extends Repository {
  unread_count: number;
}

export interface RepoNamespace {
  owner: string;
  avatar_url: string;
  repos: RepoInfo[];
}

export interface ReposEndpoint {
  list: () => Promise<RepoNamespace[]>;
}
