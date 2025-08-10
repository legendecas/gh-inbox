import type { ThreadFilter } from "../presets";

const kTypeMap = {
  issue: "Issue",
  pull: "PullRequest",
  discussion: "Discussion",
} as Record<string, string>;

export class FilterBuilder {
  #archived = false;
  #filters: ThreadFilter[] = [];

  fromRecord(record: Record<string, string[]>): this {
    // eslint-disable-next-line prefer-const
    for (let [key, values] of Object.entries(record)) {
      if (key === "archived") {
        this.filterArchived(values[0] === "true");
        continue;
      }

      const negative = key.at(0) === "-";
      if (negative) {
        key = key.slice(1);
      }

      let filter: ThreadFilter | undefined;
      if (key === "repo") {
        filter = this.filterRepoName(values[0]);
      } else if (key === "repo_id") {
        filter = this.filterRepo(values[0]);
      } else if (key === "owner") {
        filter = this.filterOwnerName(values[0]);
      } else if (key === "unread") {
        filter = this.filterUnread(values[0] === "true");
      } else if (key === "bookmarked") {
        filter = this.filterBookmarked(values[0] === "true");
      } else if (key === "types" || key === "type") {
        filter = this.filterTypes(values);
      } else if (key === "labels" || key === "label") {
        filter = this.filterLabels(values);
      } else if (key === "reasons" || key === "reason") {
        filter = this.filterReasons(values);
      }

      if (filter == null) {
        continue;
      }

      if (negative) {
        filter = {
          NOT: filter,
        };
      }
      this.#filters.push(filter);
    }
    return this;
  }

  private filterArchived(archived = false): this {
    this.#archived = archived;
    return this;
  }

  private filterUnread(unread = true): ThreadFilter {
    return { unread };
  }

  private filterBookmarked(bookmarked = true): ThreadFilter {
    return { bookmarked };
  }

  private filterRepo(repoId: string): ThreadFilter {
    return {
      repository_id: repoId,
    };
  }

  private filterRepoName(repoName: string): ThreadFilter {
    return {
      repository: {
        full_name: repoName,
      },
    };
  }

  private filterOwnerName(owner: string): ThreadFilter {
    return {
      repository: {
        owner: {
          login: owner,
        },
      },
    };
  }

  private filterTypes(types: string[]): ThreadFilter {
    return {
      OR: types.map((type) => ({
        subject_type: kTypeMap[type] || type,
      })),
    };
  }

  private filterLabels(labels: string[]): ThreadFilter {
    return {
      OR: labels.map((label) => ({
        subject: {
          labels: { contains: `|${label}|` },
        },
      })),
    };
  }

  private filterReasons(reasons: string[]): ThreadFilter {
    return {
      OR: reasons.map((reason) => ({
        reasons: { contains: `|${reason}|` },
      })),
    };
  }

  build(): ThreadFilter {
    return {
      AND: this.#filters,
      archived: this.#archived,
    };
  }
}
