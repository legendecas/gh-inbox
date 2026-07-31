import {
  formatStringList,
  parseStringListStr,
} from "../../common/string-list.ts";
import type { Prisma } from "../database/prisma.ts";
import { type Logger } from "../utils/logger.ts";

// One-time migration for rows created before the sync task started keying on
// subject_url. GitHub may return different thread ids for the same PR/issue,
// which used to produce duplicate rows per subject. Merge each duplicate group
// into a single row.
export class DedupeThreadsTask {
  #db: Prisma;
  #logger: Logger;

  constructor(db: Prisma, logger: Logger) {
    this.#db = db;
    this.#logger = logger.child({ name: "dedupe-threads" });
  }

  async run(): Promise<void> {
    const groups = await this.#db.instance.thread.groupBy({
      by: ["endpoint_id", "subject_url"],
      having: { endpoint_id: { _count: { gt: 1 } } },
    });

    if (groups.length === 0) {
      this.#logger.info("No duplicate threads found");
      return;
    }

    this.#logger.info(`Merging ${groups.length} duplicate thread group(s)`);
    for (const group of groups) {
      await this.mergeGroup(group.endpoint_id, group.subject_url);
    }
  }

  async mergeGroup(endpointId: number, subjectUrl: string): Promise<void> {
    const threads = await this.#db.instance.thread.findMany({
      where: { endpoint_id: endpointId, subject_url: subjectUrl },
      orderBy: [{ updated_at: "desc" }, { id: "asc" }],
    });

    // Keep the row with the freshest activity; fold the rest into it.
    const primary = threads[0];
    const duplicates = threads.slice(1);

    const reasons = new Set<string>();
    let maxUpdatedAt = primary.updated_at;
    let lastReadAt: Date | null = null;
    let refreshedAt: Date | null = null;
    let anyUnread = false;
    let allArchived = true;
    let maxArchivedAt: Date | null = null;
    let anyBookmarked = false;
    let minBookmarkedAt: Date | null = null;

    for (const thread of threads) {
      for (const reason of parseStringListStr(thread.reasons)) {
        reasons.add(reason);
      }
      if (thread.updated_at.getTime() > maxUpdatedAt.getTime()) {
        maxUpdatedAt = thread.updated_at;
      }
      if (
        thread.last_read_at != null &&
        (lastReadAt == null ||
          thread.last_read_at.getTime() > lastReadAt.getTime())
      ) {
        lastReadAt = thread.last_read_at;
      }
      if (
        thread.refreshed_at != null &&
        (refreshedAt == null ||
          thread.refreshed_at.getTime() > refreshedAt.getTime())
      ) {
        refreshedAt = thread.refreshed_at;
      }
      anyUnread ||= thread.unread;
      if (!(thread.archived && thread.archived_at != null)) {
        allArchived = false;
      }
      if (
        thread.archived_at != null &&
        (maxArchivedAt == null ||
          thread.archived_at.getTime() > maxArchivedAt.getTime())
      ) {
        maxArchivedAt = thread.archived_at;
      }
      anyBookmarked ||= thread.bookmarked;
      if (
        thread.bookmarked_at != null &&
        (minBookmarkedAt == null ||
          thread.bookmarked_at.getTime() < minBookmarkedAt.getTime())
      ) {
        minBookmarkedAt = thread.bookmarked_at;
      }
    }

    // Mirror the unread resolution used by the sync task: unread when the
    // latest activity is newer than the latest read timestamp.
    const unread =
      lastReadAt != null
        ? maxUpdatedAt.getTime() > lastReadAt.getTime()
        : anyUnread;

    await this.#db.instance.$transaction([
      this.#db.instance.thread.update({
        where: { endpoint_id: endpointId, id: primary.id },
        data: {
          reasons: formatStringList(Array.from(reasons)),
          updated_at: maxUpdatedAt,
          refreshed_at: refreshedAt,
          unread,
          last_read_at: lastReadAt,
          archived: allArchived,
          archived_at: allArchived ? maxArchivedAt : null,
          bookmarked: anyBookmarked,
          bookmarked_at: anyBookmarked ? minBookmarkedAt : null,
        },
      }),
      this.#db.instance.thread.deleteMany({
        where: {
          endpoint_id: endpointId,
          subject_url: subjectUrl,
          id: { in: duplicates.map((thread) => thread.id) },
        },
      }),
    ]);

    this.#logger.info(
      `Merged ${duplicates.length} duplicate thread(s) into ${primary.id} for ${subjectUrl}`,
    );
  }
}
