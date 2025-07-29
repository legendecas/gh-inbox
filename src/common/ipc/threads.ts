import type { Label, Thread } from "../../generated/prisma/index.ts";
import type { StateType } from "../github-constants.ts";
import type { ThreadFilter } from "../presets.ts";

export interface ThreadItem extends Thread {
  state: StateType;
  labels: Label[];
  html_url: string;
}

export interface ThreadListOptions {
  page?: number;
  pageSize?: number;
  filter?: ThreadFilter;
}

export interface ThreadListResult {
  totalCount: number;
  threads: ThreadItem[];
}

export interface ThreadEndpoint {
  list: (options: ThreadListOptions) => Promise<ThreadListResult>;
  archive: (threads: string[]) => Promise<void>;
}
