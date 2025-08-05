import { kSubjectType } from "../../common/github-constants.ts";
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
  Owner,
  PullRequest,
  Thread,
  ThreadRepository,
} from "../github/types.ts";
import { logger } from "../utils/logger.ts";
import {
  parseHeaderLink,
  resolveIfArchived,
  resolveIfRead,
} from "../utils/thread.ts";

const kSupportedSubjectTypes: string[] = [
  kSubjectType.PullRequest,
  kSubjectType.Issue,
  kSubjectType.Discussion,
];

type RepositoryMap = Map<string, ThreadRepository>;
type LabelMap = Map<string, [string, Label]>;

export class FetchNotificationsTask {
  #db: Prisma;
  #gh: GitHubClient;
  #endpointId: number;
  #lastRun?: Date;

  constructor(
    db: Prisma,
    gh: GitHubClient,
    endpointId: number,
    lastRun?: Date,
  ) {
    this.#db = db;
    this.#gh = gh;
    this.#endpointId = endpointId;
    this.#lastRun = lastRun;
  }

  async run() {
    const since =
      this.#lastRun?.toISOString() ??
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Fetch notifications from the last 24 hours
    const before = new Date().toISOString();
    logger.log(
      `Fetching notifications for endpoint ${this.#endpointId} since ${since} until ${before}`,
    );

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
    const seenRepositories: RepositoryMap = new Map();
    const labels: LabelMap = new Map();

    for (const thread of threads) {
      try {
        await this.updateThread(thread, seenRepositories, labels);
      } catch (error) {
        logger.error(`Error processing thread ${thread.url}:`, error);
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
    logger.info(`Processing thread: ${subjectUrl}`);
    if (!kSupportedSubjectTypes.includes(subject.type)) {
      logger.warn(`Unsupported subject type: ${subject.type}`);
      return;
    }

    if (!seenRepositories.has(`${repository.id}`)) {
      await this.updateRepository(repository);
      seenRepositories.set(`${repository.id}`, repository);
    }

    const subjectNumber = getSubjectNumberFromUrl(subjectUrl);
    if (subjectNumber === null) {
      logger.warn(`Skipping thread with invalid subject URL: ${subjectUrl}`);
      return; // Skip threads with invalid subject URLs
    }

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
        logger.info(`Update subject: ${subjectUrl}`);
        await this.updateSubject(subject, repository, labels);
      }

      await this.#db.instance.thread.update({
        where: { id },
        data: {
          reasons: reasonsStr,
          updated_at,
          unread: isUnread,
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
    const resp = await this.#gh.instance.request<
      Issue | PullRequest | Discussion
    >(`GET ${new URL(subject.url).pathname}` as any);
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
      logger.warn(`Unsupported subject type: ${subject.type}`);
      return;
    }
  }

  async updateIssue(issue: Issue, repository: ThreadRepository): Promise<void> {
    const {
      id,
      number,
      title,
      state,
      locked,
      created_at,
      updated_at,
      closed_at,
      comments,
      html_url,
      user,
      labels,
    } = issue;
    const labelsStr = formatStringList(
      labels.map((label) => `${(label as Label).name}`),
    );
    const labelIdsStr = formatStringList(
      labels.map((label) => `${(label as Label).id}`),
    );

    await this.#db.instance.subject.upsert({
      where: { id: `${id}` },
      create: {
        id: `${id}`,
        subject_type: kSubjectType.Issue,
        number,
        title,
        state,
        locked,
        comment_count: comments,
        html_url,
        created_at: new Date(created_at),
        updated_at: new Date(updated_at),
        closed_at: closed_at != null ? new Date(closed_at) : null,
        user_id: user ? `${user.id}` : "",
        user_login: user ? user.login : "",
        labels: labelsStr,
        label_ids: labelIdsStr,
        repository_id: `${repository.id}`,
        endpoint_id: this.#endpointId,
      },
      update: {
        title,
        state,
        locked,
        comment_count: comments,
        html_url,
        created_at: new Date(created_at),
        updated_at: new Date(updated_at),
        closed_at: closed_at != null ? new Date(closed_at) : null,
        user_id: user ? `${user.id}` : "",
        user_login: user ? user.login : "",
        labels: labelsStr,
        label_ids: labelIdsStr,
      },
    });
  }

  async updatePullRequest(
    pullRequest: PullRequest,
    repository: ThreadRepository,
  ): Promise<void> {
    const {
      id,
      number,
      title,
      state,
      locked,
      draft: is_draft,
      created_at,
      updated_at,
      closed_at,
      merged_at,
      comments,
      html_url,
      user,
      labels,
      merged,
      mergeable,
      mergeable_state,
    } = pullRequest;
    const labelsStr = formatStringList(labels.map((label) => `${label.name}`));
    const labelIdsStr = formatStringList(labels.map((label) => `${label.id}`));

    await this.#db.instance.subject.upsert({
      where: { id: `${id}` },
      create: {
        id: `${id}`,
        subject_type: kSubjectType.PullRequest,
        number,
        title,
        state,
        locked,
        is_draft,
        comment_count: comments,
        html_url,
        created_at: new Date(created_at),
        updated_at: new Date(updated_at),
        closed_at: closed_at != null ? new Date(closed_at) : null,
        merged_at: merged_at != null ? new Date(merged_at) : null,
        user_id: user ? `${user.id}` : "",
        user_login: user ? user.login : "",
        labels: labelsStr,
        label_ids: labelIdsStr,
        repository_id: `${repository.id}`,
        merged,
        mergeable: mergeable === true,
        mergeable_state,
        endpoint_id: this.#endpointId,
      },
      update: {
        title,
        state,
        locked,
        is_draft,
        comment_count: comments,
        html_url,
        created_at: new Date(created_at),
        updated_at: new Date(updated_at),
        closed_at: closed_at != null ? new Date(closed_at) : null,
        merged_at: merged_at != null ? new Date(merged_at) : null,
        user_id: user ? `${user.id}` : "",
        user_login: user ? user.login : "",
        labels: labelsStr,
        label_ids: labelIdsStr,
        merged,
        mergeable: mergeable === true,
        mergeable_state,
      },
    });
  }

  async updateDiscussion(
    discussion: Discussion,
    repository: ThreadRepository,
  ): Promise<void> {
    const {
      id,
      number,
      title,
      state,
      locked,
      created_at,
      updated_at,
      answer_chosen_at,
      comments,
      html_url,
      user,
      labels,
    } = discussion;
    const labelsStr = formatStringList(
      (labels ?? []).map((label) => `${label.name}`),
    );
    const labelIdsStr = formatStringList(
      (labels ?? []).map((label) => `${label.id}`),
    );

    await this.#db.instance.subject.upsert({
      where: { id: `${id}` },
      create: {
        id: `${id}`,
        subject_type: kSubjectType.Discussion,
        number,
        title,
        state,
        locked,
        comment_count: comments,
        html_url,
        created_at: new Date(created_at),
        updated_at: new Date(updated_at),
        closed_at: answer_chosen_at != null ? new Date(answer_chosen_at) : null,
        user_id: user ? `${user.id}` : "",
        user_login: user ? user.login : "",
        labels: labelsStr,
        label_ids: labelIdsStr,
        repository_id: `${repository.id}`,
        endpoint_id: this.#endpointId,
      },
      update: {
        title,
        state,
        locked,
        comment_count: comments,
        html_url,
        created_at: new Date(created_at),
        updated_at: new Date(updated_at),
        closed_at: answer_chosen_at != null ? new Date(answer_chosen_at) : null,
        user_id: user ? `${user.id}` : "",
        user_login: user ? user.login : "",
        labels: labelsStr,
        label_ids: labelIdsStr,
      },
    });
  }

  async updateLabels(labels: Map<string, [string, Label]>): Promise<void> {
    for (const [repositoryId, label] of labels.values()) {
      await this.#db.instance.label.upsert({
        where: { id: `${label.id}` },
        create: {
          id: `${label.id}`,
          url: label.url,
          name: label.name,
          color: label.color,
          description: label.description ?? "",
          repository_id: repositoryId,
          endpoint_id: this.#endpointId,
        },
        update: {
          url: label.url,
          name: label.name,
          color: label.color,
          description: label.description ?? "",
        },
      });
    }
  }

  async updateRepository(repo: ThreadRepository): Promise<void> {
    const {
      id,
      name,
      full_name,
      private: isPrivate,
      description,
      fork,
      html_url,
      owner,
    } = repo;

    await this.#db.instance.owner.upsert({
      where: { id: `${owner.id}` },
      create: {
        id: `${owner.id}`,
        login: owner.login,
        avatar_url: owner.avatar_url,
        type: owner.type,
        endpoint_id: this.#endpointId,
      },
      update: {
        login: owner.login,
        avatar_url: owner.avatar_url,
        type: owner.type,
      },
    });

    await this.#db.instance.repository.upsert({
      where: { id: `${id}` },
      create: {
        id: `${id}`,
        name,
        full_name,
        private: isPrivate,
        description: description || "",
        fork,
        html_url,
        endpoint_id: this.#endpointId,
        owner_id: `${repo.owner.id}`,
      },
      update: {
        name,
        full_name,
        private: isPrivate,
        description: description || "",
      },
    });
  }

  async updateRepositories(repositories: Map<string, ThreadRepository>) {
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
          endpoint_id: this.#endpointId,
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
          endpoint_id: this.#endpointId,
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

// Urls like https://api.github.com/repos/nodejs/node-gyp/issues/3095
function getSubjectNumberFromUrl(url: string): number | null {
  const match = new URL(url).pathname.split("/");
  if (match.length < 6) {
    return null; // Not a valid issue or PR URL
  }

  return parseInt(match[5], 10);
}
