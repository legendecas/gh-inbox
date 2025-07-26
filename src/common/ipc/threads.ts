import type { Thread } from "../../generated/prisma/index.ts";

export interface ThreadEndpoint {
  list: () => Promise<Thread[]>;
}
