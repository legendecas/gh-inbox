import {
  CommentDiscussionIcon,
  DiscussionClosedIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
} from "@primer/octicons-react";
import { RelativeTime, Tooltip } from "@primer/react";
import React from "react";

import { type StateType, kSubjectType } from "../../../common/github-constants";
import type { ThreadItem } from "../../../common/ipc/threads";
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

export function ThreadItem({ thread, selected, setSelected }: ThreadItemProps) {
  function onClick() {
    window.ipc.invoke("threads", "markAsRead", thread.endpoint_id, [thread.id]);
  }

  return (
    <tr className="thread-item" data-state={thread.unread ? "unread" : "read"}>
      <td>
        <input
          className="thread-checkbox"
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            setSelected(thread.id, e.target.checked);
          }}
        ></input>
      </td>
      <td>
        <div className="thread-icon" data-state={thread.state}>
          <ThreadIcon subjectType={thread.subject_type} state={thread.state} />
        </div>
      </td>
      <td>
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
      <td>
        <span className="thread-repo text-sm">
          {getRepoFromSubjectUrl(thread.subject_url)}
        </span>
      </td>
      <td>
        <span className="thread-reason text-sm">
          <ReasonLabelGroup reasonsStr={thread.reasons} />
        </span>
      </td>
      <td>
        <Tooltip text={thread.updated_at.toLocaleString()}>
          {/* Tooltip requires an interactive child node */}
          <button>
            <RelativeTime
              className="text-sm"
              format="micro"
              prefix=""
              date={thread.updated_at}
            />
          </button>
        </Tooltip>
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
