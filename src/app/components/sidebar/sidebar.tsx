import React from "react";
import { Avatar, CounterLabel, NavList } from "@primer/react";
import { RepoIcon } from "@primer/octicons-react";
import "./sidebar.css";
import { useRepos } from "../../hooks/use-repos";

export function Sidebar() {
  const namespaces = useRepos();

  return (
    <div className="sidebar flex flex-col w-full">
      <ul className="w-full">
        <NavList>
          {namespaces.map((ns) => (
            <NavList.Item key={ns.owner} defaultOpen={true}>
              <NavList.LeadingVisual>
                <Avatar
                  square
                  src={ns.avatar_url}
                  alt={`${ns.owner}'s avatar`}
                />
              </NavList.LeadingVisual>
              {ns.owner}
              <NavList.TrailingVisual>
                <CounterLabel>
                  {ns.repos.reduce((acc, repo) => acc + repo.unread_count, 0)}
                </CounterLabel>
              </NavList.TrailingVisual>

              <NavList.SubNav>
                {ns.repos.map((repo) => (
                  <NavList.Item key={repo.id}>
                    <NavList.LeadingVisual>
                      <RepoIcon />
                    </NavList.LeadingVisual>
                    {repoNameFromFullName(repo.full_name)}{" "}
                    <NavList.TrailingVisual>
                      <CounterLabel>{repo.unread_count}</CounterLabel>
                    </NavList.TrailingVisual>
                  </NavList.Item>
                ))}
              </NavList.SubNav>
            </NavList.Item>
          ))}
        </NavList>
      </ul>
    </div>
  );
}

function repoNameFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[1] : fullName;
}
