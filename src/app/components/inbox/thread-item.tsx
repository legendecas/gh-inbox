import {
  BookmarkFillIcon,
  BookmarkIcon,
  CommentDiscussionIcon,
  DiscussionClosedIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
} from "@primer/octicons-react";
import { Button, RelativeTime, Truncate } from "@primer/react";
import React from "react";

import { type StateType, kSubjectType } from "../../../common/github-constants";
import type { ThreadItem } from "../../../common/ipc/threads";
import { kTypeReverseMap } from "../../../common/search-builder/filter-builder";
import { useFilterContext } from "../../hooks/use-filter";
import { useThreadsContext } from "../../hooks/use-threads";
import { LabelBadgeGroup } from "./label-badge";
import { ReasonLabelGroup } from "./reason-label";
import "./thread-item.css";

export interface ThreadItemProps {
  thread: ThreadItem;
  selected: boolean;
  setSelected: (threadId: string, checked: boolean) => void;
}

function ThreadIcon({
  subjectType,
  state,
}: {
  subjectType: string;
  state: StateType;
}) {
  switch (subjectType) {
    case kSubjectType.Issue:
      if (state === "closed") {
        return <IssueClosedIcon size={16} />;
      }
      return <IssueOpenedIcon size={16} />;
    case kSubjectType.PullRequest:
      if (state === "closed") {
        return <GitPullRequestClosedIcon size={16} />;
      }
      if (state === "draft") {
        return <GitPullRequestDraftIcon size={16} />;
      }
      return <GitPullRequestIcon size={16} />;
    case kSubjectType.Discussion:
      if (state === "closed") {
        return <DiscussionClosedIcon size={16} />;
      }
      return <CommentDiscussionIcon size={16} />;
    default:
      return null;
  }
}

function BookmarkButton({ thread }: { thread: ThreadItem }) {
  const { refreshThreads } = useThreadsContext();
  async function onClick() {
    await window.ipc.invoke(
      "threads",
      "bookmark",
      thread.endpoint_id,
      [thread.id],
      !thread.bookmarked,
    );
    refreshThreads();
  }

  return thread.bookmarked ? (
    <Button variant="invisible" onClick={onClick}>
      <BookmarkFillIcon size={16} />
    </Button>
  ) : (
    <Button variant="invisible" onClick={onClick}>
      <BookmarkIcon size={16} />
    </Button>
  );
}

export function ThreadItem({ thread, selected, setSelected }: ThreadItemProps) {
  const { refreshThreads } = useThreadsContext();
  const { appendFilter } = useFilterContext();

  async function onClick() {
    await window.ipc.invoke("threads", "markAsRead", thread.endpoint_id, [
      thread.id,
    ]);
    refreshThreads();
  }

  const repo = getRepoFromSubjectUrl(thread.subject_url);

  return (
    <tr className="thread-item" data-state={thread.unread ? "unread" : "read"}>
      <td className="thread-checkbox-cell">
        <input
          className="thread-checkbox"
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            setSelected(thread.id, e.target.checked);
          }}
        ></input>
      </td>
      <td className="thread-bookmark-cell">
        <BookmarkButton thread={thread} />
      </td>
      <td className="thread-icon-cell">
        <a
          className="thread-icon"
          data-type={thread.subject_type}
          data-state={thread.state}
          onClick={() =>
            appendFilter(`type:${kTypeReverseMap[thread.subject_type]}`)
          }
        >
          <ThreadIcon subjectType={thread.subject_type} state={thread.state} />
        </a>
      </td>
      <td className="thread-title-cell">
        <div className="">
          <a
            className="title"
            href={thread.html_url}
            target="_blank"
            onClick={onClick}
          >
            {thread.subject_title}
          </a>
          <LabelBadgeGroup labels={thread.labels} />
        </div>
      </td>
      <td className="thread-repo-cell">
        <a
          className="thread-text-link"
          onClick={() => appendFilter(`repo:${repo}`)}
        >
          <Truncate className="thread-repo text-sm" title={repo}>
            {repo}
          </Truncate>
        </a>
      </td>
      <td className="thread-user-cell">
        <a
          className="thread-text-link"
          onClick={() => appendFilter(`author:${thread.user_login}`)}
        >
          <Truncate className="thread-user text-sm" title={thread.user_login}>
            {thread.user_login}
          </Truncate>
        </a>
      </td>
      <td className="thread-reason-cell">
        <ReasonLabelGroup reasonsStr={thread.reasons} />
      </td>
      <td className="thread-updated-cell">
        <RelativeTime
          className="text-sm"
          format="micro"
          prefix=""
          date={thread.updated_at}
        />
      </td>
    </tr>
  );
}

function getRepoFromSubjectUrl(subjectUrl: string): string {
  const url = new URL(subjectUrl);
  const pathParts = url.pathname.split("/");
  if (pathParts.length >= 4) {
    return `${pathParts[2]}/${pathParts[3]}`;
  }
  return "";
}
