import React from "react";
import {
  IssueOpenedIcon,
  IssueClosedIcon,
  GitPullRequestIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  CommentDiscussionIcon,
  DiscussionClosedIcon,
} from "@primer/octicons-react";
import { RelativeTime } from "@primer/react";
import { kSubjectType, type StateType } from "../../../common/github-constants";
import { parseStringListStr } from "../../../common/string-list";
import type { ThreadItem } from "../../../common/ipc/threads";
import { LabelBadge } from "./label-badge";
import "./thread-item.css";

export interface ThreadItemProps {
  thread: ThreadItem;
  checked: boolean;
  setChecked: (threadId: string, checked: boolean) => void;
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

export function ThreadItem({ thread, checked, setChecked }: ThreadItemProps) {
  return (
    <tr className="thread-item" data-state={thread.unread ? "unread" : "read"}>
      <td>
        <input
          className="thread-checkbox"
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            setChecked(thread.id, e.target.checked);
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
          <a className="title" href={thread.html_url} target="_blank">
            {thread.subject_title}
          </a>
          {thread.labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      </td>
      <td>
        <span className="thread-repo text-sm">
          {getRepoFromSubjectUrl(thread.subject_url)}
        </span>
      </td>
      <td>
        <span className="thread-reason text-sm">
          {parseStringListStr(thread.reasons).join(",")}
        </span>
      </td>
      <td>
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
