import React from "react";
import { Avatar, CounterLabel, ActionList } from "@primer/react";
import { LockIcon, RepoIcon, SearchIcon } from "@primer/octicons-react";
import "./sidebar.css";
import { usePresetFilter } from "../../hooks/use-preset-filter";
import { useFilterContext } from "../../hooks/use-filter";
import {
  kPresetFilterTypes,
  repoFilter,
  type kPresetFilterType,
} from "../../../common/presets";

export function Sidebar() {
  const { setFilter } = useFilterContext();
  const { presetFilters, repoNamespaces } = usePresetFilter();

  return (
    <ActionList>
      {presetFilters.map((filter) => (
        <ActionList.Item
          key={filter.type}
          onSelect={() => {
            console.log("Setting filter:", filter.type);
            setFilter(kPresetFilterTypes[filter.type as kPresetFilterType]);
          }}
        >
          <ActionList.LeadingVisual>
            <SearchIcon />
          </ActionList.LeadingVisual>
          {filter.type}
          <ActionList.TrailingVisual>
            <CounterLabel>{filter.unread_count}</CounterLabel>
          </ActionList.TrailingVisual>
        </ActionList.Item>
      ))}
      <ActionList.Divider />
      {repoNamespaces.map((ns) => (
        <>
          <ActionList.Item key={ns.owner}>
            <ActionList.LeadingVisual>
              <Avatar square src={ns.avatar_url} alt={`${ns.owner}'s avatar`} />
            </ActionList.LeadingVisual>
            {ns.owner}
          </ActionList.Item>

          {ns.repos.map((repo) => (
            <ActionList.Item
              key={repo.id}
              onSelect={() => {
                console.log("Setting filter for repo:", repo.full_name);
                setFilter(repoFilter(repo.id));
              }}
            >
              <ActionList.LeadingVisual>
                {repo.private ? <LockIcon fill="#dbab09" /> : <RepoIcon />}
              </ActionList.LeadingVisual>
              {repoNameFromFullName(repo.full_name)}{" "}
              <ActionList.TrailingVisual>
                <CounterLabel>{repo.unread_count}</CounterLabel>
              </ActionList.TrailingVisual>
            </ActionList.Item>
          ))}
        </>
      ))}
    </ActionList>
  );
}

function repoNameFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[1] : fullName;
}
