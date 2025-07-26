import React, { Fragment } from "react";
import { RepoIcon } from "@primer/octicons-react";
import "./sidebar.css";
import { useRepos } from "../../hooks/use-repos";

export function Sidebar() {
  const namespaces = useRepos();

  return (
    <div className="sidebar flex flex-col w-full">
      <ul className="w-full">
        {namespaces.map((ns) => (
          <Fragment key={ns.owner}>
            <li key={ns.owner} className="nav-item owner-item w-full">
              <a className="owner-label">{ns.owner}</a>
            </li>
            {ns.repos.map((repo) => (
              <li key={repo.id} className="nav-item repo-item w-full">
                <a className="repo-label">
                  <RepoIcon /> {repoNameFromFullName(repo.full_name)}{" "}
                  <span className="badge unread-badge">
                    {repo.unread_count}
                  </span>
                </a>
              </li>
            ))}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}

function repoNameFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[1] : fullName;
}
