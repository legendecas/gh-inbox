import type { ThreadFilter } from "../presets";

export class FilterBuilder {
  #archived = false;
  #filters: ThreadFilter[] = [];

  fromRecord(record: Record<string, string[]>): this {
    for (const [key, values] of Object.entries(record)) {
      if (key === "repo") {
        this.filterRepoName(values[0]);
      } else if (key === "repo_id") {
        this.filterRepo(values[0]);
      } else if (key === "owner") {
        this.filterOwnerName(values[0]);
      } else if (key === "archived") {
        this.filterArchived(values[0] === "true");
      } else if (key === "unread") {
        this.filterUnread(values[0] === "true");
      } else if (key === "labels") {
        this.filterLabels(values);
      } else if (key === "reasons") {
        this.filterReasons(values);
      }
    }
    return this;
  }

  filterArchived(archived = false): this {
    this.#archived = archived;
    return this;
  }

  filterUnread(unread = true): this {
    this.#filters.push({ unread });
    return this;
  }

  filterRepo(repoId: string): this {
    this.#filters.push({
      repository_id: repoId,
    });
    return this;
  }

  filterRepoName(repoName: string): this {
    this.#filters.push({
      repository: {
        full_name: repoName,
      },
    });
    return this;
  }

  filterOwnerName(owner: string): this {
    this.#filters.push({
      repository: {
        owner: {
          login: owner,
        },
      },
    });
    return this;
  }

  filterLabels(labels: string[]): this {
    this.#filters.push({
      OR: labels.map((label) => ({
        subject: {
          labels: { contains: `|${label}|` },
        },
      })),
    });
    return this;
  }

  filterReasons(reasons: string[]): this {
    this.#filters.push({
      OR: reasons.map((reason) => ({
        reasons: { contains: `|${reason}|` },
      })),
    });
    return this;
  }

  build(): ThreadFilter {
    return {
      AND: this.#filters,
      archived: this.#archived,
    };
  }
}
