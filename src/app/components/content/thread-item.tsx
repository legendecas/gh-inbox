import React from 'react';
import { IssueOpenedIcon, GitPullRequestIcon } from '@primer/octicons-react';
import type { Thread } from '../../../generated/prisma';
import { kSubjectType } from '../../../common/github-constants';

export interface ThreadItemProps {
  thread: Thread;
}

export function ThreadItem({ thread }: ThreadItemProps) {
  return (
    <tr className="thread-item">
      <td>
        <div className=''>
          {
            thread.subject_type === kSubjectType.Issue ? (
              <IssueOpenedIcon size={16} />
            ) : (
              <GitPullRequestIcon size={16} />
            )
          }
        </div>
      </td>
      <td>
        <a>{thread.subject_title}</a>
      </td>
      <td>
        <span className="thread-repo">{getRepoFromSubjectUrl(thread.subject_url)}</span>
      </td>
      <td>
        <span className="thread-reason">{thread.reasons}</span>
      </td>
      <td>
        <span className="thread-updated-at">{new Date(thread.updated_at).toLocaleDateString()}</span>
      </td>
    </tr>
  );
}

function getRepoFromSubjectUrl(subjectUrl: string): string {
  const url = new URL(subjectUrl);
  const pathParts = url.pathname.split('/');
  if (pathParts.length >= 4) {
    return `${pathParts[2]}/${pathParts[3]}`;
  }
  return '';
}
