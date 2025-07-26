import type { Prisma } from "../database/prisma.ts";
import { GitHubClient } from "../github/client.ts";
import type { Owner, Thread, ThreadRepository } from "../github/types.ts";
import { logger } from "../utils/logger.ts";
import {
  formatReasons,
  parseHeaderLink,
  parseReasonsString,
  resolveIfArchived,
  resolveIfRead,
} from "../utils/thread.ts";

export class FetchNotificationsTask {
  #db: Prisma;
  #gh: GitHubClient;
  constructor(db: Prisma, gh: GitHubClient) {
    this.#db = db;
    this.#gh = gh;
  }

  async run() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Fetch notifications from the last 24 hours
    const before = new Date().toISOString();
    let page: number | undefined = 1;
    while (true) {
      try {
        logger.log(`Fetching page: ${page}`);
        page = await this.runForPage(page, since, before);
        if (page === undefined) {
          logger.log("All pages fetched");
          break; // No more pages to fetch
        }
      } catch (error) {
        logger.error("Error fetching notifications:", error);
        break; // Exit on error
      }
    }
  }

  async runForPage(page: number, since: string, before: string) {
    const resp = await this.#gh.instance.request("GET /notifications", {
      all: true,
      since,
      before,
      page,
      per_page: 50,
    });
    if (resp.status !== 200) {
      throw new Error(`Failed to fetch notifications: ${resp.data}`);
    }
    const links = parseHeaderLink(resp.headers.link || "");
    const lastPage = links.last
      ? Number(new URL(links.last).searchParams.get("page"))
      : null;

    const threads = resp.data;
    if (!Array.isArray(threads)) {
      throw new Error(
        `Expected an array of notifications, got: ${typeof threads}`,
      );
    }
    if (threads.length === 0) {
      logger.log("No new notifications");
      return;
    }
    logger.log(`Fetched ${threads.length} notifications`);

    await this.saveNotifications(threads);

    if (lastPage && page < lastPage) {
      return page + 1;
    } else {
      return undefined;
    }
  }

  async saveNotifications(threads: Thread[]) {
    const repositories = new Map<string, ThreadRepository>();

    for (const thread of threads) {
      const {
        id,
        subject,
        reason,
        unread,
        last_read_at,
        updated_at,
        repository,
      } = thread;
      repositories.set(`${repository.id}`, repository);

      const found = await this.#db.instance.thread.findUnique({
        where: { id },
      });

      if (found) {
        const reasons = new Set(parseReasonsString(found.reasons));
        reasons.add(reason);
        const reasonsStr = formatReasons(Array.from(reasons));

        const { 0: isUnread, 1: lastReadAt } = resolveIfRead(thread, found);
        const isArchived = resolveIfArchived(thread, found);

        await this.#db.instance.thread.update({
          where: { id },
          data: {
            reasons: reasonsStr,
            updated_at,
            unread: isUnread,
            last_read_at: lastReadAt,
            subject_title: subject.title,
            subject_url: subject.url,
            subject_type: subject.type,
            subject_latest_comment_url: subject.latest_comment_url,

            archived: isArchived,
            archived_at: isArchived ? found.archived_at : null,
          },
        });

        continue;
      }

      await this.#db.instance.thread.create({
        data: {
          id,
          reasons: formatReasons([reason]),
          updated_at,
          unread,
          last_read_at,
          subject_title: subject.title,
          subject_url: subject.url,
          subject_type: subject.type,
          subject_latest_comment_url: subject.latest_comment_url,
          repository_id: `${repository.id}`,
          endpoint_id: 1,
        },
      });
    }

    const owners = new Map<string, Owner>();

    for (const [id, repository] of repositories) {
      owners.set(`${repository.owner.id}`, repository.owner);
      await this.#db.instance.repository.upsert({
        where: { id: `${id}` },
        create: {
          id: `${id}`,
          name: repository.name,
          full_name: repository.full_name,
          private: repository.private,
          description: repository.description || "",
          fork: repository.fork,
          html_url: repository.html_url,
          endpoint_id: 1,
          owner_id: `${repository.owner.id}`,
        },
        update: {
          name: repository.name,
          full_name: repository.full_name,
          private: repository.private,
          description: repository.description || "",
        },
      });
    }

    for (const [id, owner] of owners) {
      await this.#db.instance.owner.upsert({
        where: { id },
        create: {
          id,
          login: owner.login,
          avatar_url: owner.avatar_url,
          type: owner.type,
          endpoint_id: 1,
        },
        update: {
          login: owner.login,
          avatar_url: owner.avatar_url,
          type: owner.type,
        },
      });
    }
  }
}
