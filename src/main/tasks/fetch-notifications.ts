import { kSubjectType } from "../../common/github-constants.ts";
import { getSubjectPathnameEssence } from "../../common/github-utils.ts";
import {
  formatStringList,
  parseStringListStr,
} from "../../common/string-list.ts";
import type { Prisma } from "../database/prisma.ts";
import { GitHubClient } from "../github/client.ts";
import type {
  Discussion,
  Issue,
  Label,
  PullRequest,
  Thread,
  ThreadRepository,
} from "../github/types.ts";
import { type Logger } from "../utils/logger.ts";
import {
  parseHeaderLink,
  resolveIfArchived,
  resolveIfRead,
} from "../utils/thread.ts";
import { BaseUpdateTask } from "./base.ts";

const kSupportedSubjectTypes: string[] = [
  kSubjectType.PullRequest,
  kSubjectType.Issue,
  kSubjectType.Discussion,
];

type RepositoryMap = Map<string, ThreadRepository>;
type LabelMap = Map<string, [string, Label]>;

export class FetchNotificationsTask extends BaseUpdateTask {
  #db: Prisma;
  #gh: GitHubClient;
  #endpointId: number;
  #logger: Logger;
  #since?: Date;

  constructor(
    db: Prisma,
    gh: GitHubClient,
    endpointId: number,
    logger: Logger,
    since?: Date,
  ) {
    super(db, endpointId);
    this.#db = db;
    this.#gh = gh;
    this.#endpointId = endpointId;
    this.#logger = logger.child({ name: "fetch-notifications" });
    this.#since = since;
  }

  async run() {
    const since =
      this.#since?.toISOString() ??
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Fetch notifications from the last 24 hours
    const before = new Date().toISOString();
    this.#logger.info(
      `Fetching notifications for endpoint ${this.#endpointId} since ${since} until ${before}`,
    );

    let page: number | undefined = 1;
    while (true) {
      this.#logger.info(`Fetching page: ${page}`);
      page = await this.runForPage(page, since, before);
      if (page === undefined) {
        this.#logger.info("All pages fetched");
        break; // No more pages to fetch
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
      this.#logger.info("No new notifications");
      return;
    }
    this.#logger.info(`Fetched ${threads.length} notifications`);

    await this.saveNotifications(threads);

    if (lastPage && page < lastPage) {
      return page + 1;
    } else {
      return undefined;
    }
  }

  async saveNotifications(threads: Thread[]) {
    const seenRepositories: RepositoryMap = new Map();
    const labels: LabelMap = new Map();

    for (const thread of threads) {
      try {
        await this.updateThread(thread, seenRepositories, labels);
      } catch (error) {
        this.#logger.error(`Error processing thread ${thread.url}: %s`, error);
        throw error;
      }
    }

    await this.updateLabels(labels);
  }

  async updateThread(
    thread: Thread,
    seenRepositories: RepositoryMap,
    labels: LabelMap,
  ): Promise<void> {
    const subjectUrl = thread.subject.url;

    const {
      id,
      subject,
      reason,
      unread,
      last_read_at,
      updated_at,
      repository,
    } = thread;
    this.#logger.info(`Processing thread: ${subjectUrl}`);
    if (!kSupportedSubjectTypes.includes(subject.type)) {
      this.#logger.warn(`Unsupported subject type: ${subject.type}`);
      return;
    }

    if (!seenRepositories.has(`${repository.id}`)) {
      await this.updateRepository(repository);
      seenRepositories.set(`${repository.id}`, repository);
    }

    const subjectUrlInfo = getSubjectPathnameEssence(subjectUrl);
    if (subjectUrlInfo === null) {
      this.#logger.warn(
        `Skipping thread with invalid subject URL: ${subjectUrl}`,
      );
      return; // Skip threads with invalid subject URLs
    }
    const { number: subjectNumber } = subjectUrlInfo;

    const found = await this.#db.instance.thread.findUnique({
      where: { id },
    });

    if (found) {
      const reasons = new Set(parseStringListStr(found.reasons));
      reasons.add(reason);
      const reasonsStr = formatStringList(Array.from(reasons));

      const { 0: isUnread, 1: lastReadAt } = resolveIfRead(thread, found);
      const isArchived = resolveIfArchived(thread, found);

      if (found.updated_at.getTime() < new Date(updated_at).getTime()) {
        this.#logger.info(`Update subject: ${subjectUrl}`);
        await this.updateSubject(subject, repository, labels);
      }

      await this.#db.instance.thread.update({
        where: { id },
        data: {
          reasons: reasonsStr,
          updated_at,
          unread: isUnread,
          refreshed_at: new Date(),
          last_read_at: lastReadAt,
          subject_number: subjectNumber,
          subject_title: subject.title,
          subject_url: subject.url,
          subject_type: subject.type,
          subject_latest_comment_url: subject.latest_comment_url,

          archived: isArchived,
          archived_at: isArchived ? found.archived_at : null,
        },
      });

      return;
    }

    await this.updateSubject(subject, repository, labels);
    await this.#db.instance.thread.create({
      data: {
        id,
        reasons: formatStringList([reason]),
        updated_at,
        refreshed_at: new Date(),
        unread,
        last_read_at,
        subject_number: subjectNumber,
        subject_title: subject.title,
        subject_url: subject.url,
        subject_type: subject.type,
        subject_latest_comment_url: subject.latest_comment_url,
        repository_id: `${repository.id}`,
        endpoint_id: this.#endpointId,
      },
    });
  }

  async updateSubject(
    subject: Thread["subject"],
    repository: ThreadRepository,
    labels: LabelMap,
  ) {
    const subjectUrlInfo = getSubjectPathnameEssence(subject.url);
    if (subjectUrlInfo === null) {
      this.#logger.warn(`Skipping subject with invalid URL: ${subject.url}`);
      return; // Skip subjects with invalid URLs
    }
    const { pathname } = subjectUrlInfo;
    const resp = await this.#gh.instance.request<
      Issue | PullRequest | Discussion
    >(`GET ${pathname}` as any);
    if (resp.status !== 200) {
      throw new Error(`Failed to fetch subject: ${resp.data}`);
    }

    for (const label of resp.data.labels as Label[]) {
      if (!labels.has(`${label.id}`)) {
        labels.set(`${label.id}`, [`${repository.id}`, label]);
      }
    }

    if (subject.type === kSubjectType.Issue) {
      await this.updateIssue(resp.data as Issue, repository);
    } else if (subject.type === kSubjectType.PullRequest) {
      await this.updatePullRequest(resp.data as PullRequest, repository);
    } else if (subject.type === kSubjectType.Discussion) {
      await this.updateDiscussion(resp.data as Discussion, repository);
    } else {
      this.#logger.warn(`Unsupported subject type: ${subject.type}`);
      return;
    }
  }
}
