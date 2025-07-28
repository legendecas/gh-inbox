import type { Label, Thread } from "../../generated/prisma/index.ts";
import type { StateType } from "../github-constants.ts";

export interface ThreadItem extends Thread {
  state: StateType;
  labels: Label[];
  html_url: string;
}

export interface ThreadEndpoint {
  list: () => Promise<ThreadItem[]>;
  archive: (threads: string[]) => Promise<void>;
}
