import { kSubjectType } from "../../common/github-constants.ts";
import { formatStringList } from "../../common/string-list.ts";
import type { Prisma } from "../database/prisma.ts";
import type {
  Discussion,
  Issue,
  Label,
  Owner,
  PullRequest,
  ThreadRepository,
} from "../github/types.ts";

export interface RepositoryRef {
  id: number | string;
}

export class BaseUpdateTask {
  protected db: Prisma;
  protected endpointId: number;

  constructor(db: Prisma, endpointId: number) {
    this.db = db;
    this.endpointId = endpointId;
  }

  async updateIssue(issue: Issue, repository: RepositoryRef): Promise<void> {
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

    await this.db.instance.subject.upsert({
      where: { id: `${id}`, endpoint_id: this.endpointId },
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
        endpoint_id: this.endpointId,
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
    repository: RepositoryRef,
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

    await this.db.instance.subject.upsert({
      where: { id: `${id}`, endpoint_id: this.endpointId },
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
        endpoint_id: this.endpointId,
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
    repository: RepositoryRef,
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

    await this.db.instance.subject.upsert({
      where: { id: `${id}`, endpoint_id: this.endpointId },
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
        endpoint_id: this.endpointId,
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
      await this.db.instance.label.upsert({
        where: { id: `${label.id}`, endpoint_id: this.endpointId },
        create: {
          id: `${label.id}`,
          url: label.url,
          name: label.name,
          color: label.color,
          description: label.description ?? "",
          repository_id: repositoryId,
          endpoint_id: this.endpointId,
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

    await this.db.instance.owner.upsert({
      where: { id: `${owner.id}`, endpoint_id: this.endpointId },
      create: {
        id: `${owner.id}`,
        login: owner.login,
        avatar_url: owner.avatar_url,
        type: owner.type,
        endpoint_id: this.endpointId,
      },
      update: {
        login: owner.login,
        avatar_url: owner.avatar_url,
        type: owner.type,
      },
    });

    await this.db.instance.repository.upsert({
      where: { id: `${id}`, endpoint_id: this.endpointId },
      create: {
        id: `${id}`,
        name,
        full_name,
        private: isPrivate,
        description: description || "",
        fork,
        html_url,
        endpoint_id: this.endpointId,
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
      await this.db.instance.repository.upsert({
        where: { id: `${id}`, endpoint_id: this.endpointId },
        create: {
          id: `${id}`,
          name: repository.name,
          full_name: repository.full_name,
          private: repository.private,
          description: repository.description || "",
          fork: repository.fork,
          html_url: repository.html_url,
          endpoint_id: this.endpointId,
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
      await this.db.instance.owner.upsert({
        where: { id, endpoint_id: this.endpointId },
        create: {
          id,
          login: owner.login,
          avatar_url: owner.avatar_url,
          type: owner.type,
          endpoint_id: this.endpointId,
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
