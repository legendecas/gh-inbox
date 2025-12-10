import { kSubjectType } from "../../common/github-constants.ts";
import { FilterBuilder } from "../../common/search-builder/filter-builder.ts";
import { SearchParser } from "../../common/search-builder/search-parser.ts";
import type { Thread } from "../../generated/prisma/index.js";
import type { Prisma } from "../database/prisma.ts";
import type { GitHubClient } from "../github/client.ts";
import type { Discussion, Issue, PullRequest } from "../github/types.ts";
import type { Logger } from "../utils/logger.ts";
import { BaseUpdateTask } from "./base.ts";

const kSupportedSubjectTypes: string[] = [
  kSubjectType.PullRequest,
  kSubjectType.Issue,
  kSubjectType.Discussion,
];

export class RefreshStatusTask extends BaseUpdateTask {
  #db: Prisma;
  #gh: GitHubClient;
  #endpointId: number;
  #logger: Logger;

  constructor(
    db: Prisma,
    gh: GitHubClient,
    endpointId: number,
    logger: Logger,
  ) {
    super(db, endpointId);
    this.#db = db;
    this.#gh = gh;
    this.#endpointId = endpointId;
    this.#logger = logger.child({ name: "refresh-status" });
  }

  async run() {
    const before = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Fetch notifications from the last 24 hours
    const savedSearches = await this.#db.instance.savedSearch.findMany({
      where: { endpoint_id: this.#endpointId },
    });
    const queries = savedSearches
      .map((s) => s.query)
      .concat("reasons:author,comment,manual,mention,team_mention");
    const searchParser = new SearchParser();
    const threadsLists = await Promise.all(
      queries.map((query) => {
        const filter = new FilterBuilder()
          .fromRecord(searchParser.parse(query))
          .build();
        return this.#db.instance.thread.findMany({
          where: {
            AND: [
              { endpoint_id: this.#endpointId, archived: false },
              filter,
              {
                OR: [{ refreshed_at: null }, { refreshed_at: { lt: before } }],
              },
            ],
          },
        });
      }),
    );
    const threads = threadsLists.flat().slice(0, 200); // Limit to 200 threads to refresh

    this.#logger.info(
      `Refreshing ${threads.length} threads for endpoint ${this.#endpointId}`,
    );

    for (const thread of threads) {
      if (!kSupportedSubjectTypes.includes(thread.subject_type)) {
        this.#logger.warn(
          `Unsupported subject type: ${thread.subject_type} for thread ${thread.id}`,
        );
        continue;
      }
      try {
        await this.refreshThread(thread);
        await this.#db.instance.thread.update({
          where: { id: thread.id, endpoint_id: this.#endpointId },
          data: { refreshed_at: new Date() },
        });
      } catch (error) {
        this.#logger.error(`Failed to refresh thread ${thread.id}: %j`, error);
      }
    }
  }

  async refreshThread(thread: Thread): Promise<void> {
    const apiPathname = new URL(thread.subject_url).pathname;
    const response = await this.#gh.instance.request(`GET ${apiPathname}`);
    if (response.status !== 200) {
      this.#logger.error(
        `Failed GitHub request for ${apiPathname}: %j`,
        response,
      );
      return;
    }

    const subject = response.data as Issue | PullRequest | Discussion;
    const savedSubject = await this.#db.instance.subject.findUnique({
      where: { id: `${subject.id}`, endpoint_id: this.#endpointId },
    });
    if (!savedSubject) {
      this.#logger.warn(
        `Subject not found for subject ${subject.id} on endpoint ${this.#endpointId}`,
      );
      return;
    }

    if (savedSubject.updated_at.toISOString() === subject.updated_at) {
      this.#logger.info(
        `Subject not updated for thread ${thread.subject_url} on endpoint ${this.#endpointId}`,
      );
      return;
    }

    switch (thread.subject_type) {
      case kSubjectType.Issue:
        await this.updateIssue(subject as Issue, {
          id: thread.repository_id,
        });
        break;
      case kSubjectType.PullRequest:
        await this.updatePullRequest(subject as PullRequest, {
          id: thread.repository_id,
        });
        break;
      case kSubjectType.Discussion:
        await this.updateDiscussion(subject as Discussion, {
          id: thread.repository_id,
        });
        break;
      default:
        this.#logger.warn(
          `Unsupported subject type: ${thread.subject_type} for thread ${thread.id}`,
        );
    }
    this.#logger.info(
      `Refreshed subject ${thread.subject_url} on endpoint ${this.#endpointId}`,
    );
  }
}
