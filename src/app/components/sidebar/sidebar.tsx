import React from "react";
import { Avatar, CounterLabel, NavList } from "@primer/react";
import { RepoIcon, SearchIcon } from "@primer/octicons-react";
import "./sidebar.css";
import { usePresetFilter } from "../../hooks/use-preset-filter";

export function Sidebar() {
  const { presetFilters, repoNamespaces } = usePresetFilter();

  return (
    <NavList>
      {presetFilters.map((filter) => (
        <NavList.Item key={filter.type} defaultOpen={true}>
          <NavList.LeadingVisual>
            <SearchIcon />
          </NavList.LeadingVisual>
          {filter.type}
          <NavList.TrailingVisual>
            <CounterLabel>{filter.unread_count}</CounterLabel>
          </NavList.TrailingVisual>
        </NavList.Item>
      ))}
      <NavList.Divider />
      {repoNamespaces.map((ns) => (
        <NavList.Item key={ns.owner} defaultOpen={true}>
          <NavList.LeadingVisual>
            <Avatar square src={ns.avatar_url} alt={`${ns.owner}'s avatar`} />
          </NavList.LeadingVisual>
          {ns.owner}

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
  );
}

function repoNameFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[1] : fullName;
}
