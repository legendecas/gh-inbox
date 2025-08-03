import React, { Fragment } from "react";
import { Avatar, CounterLabel, ActionList } from "@primer/react";
import {
  CommentDiscussionIcon,
  GoalIcon,
  type Icon,
  InboxIcon,
  LockIcon,
  RepoIcon,
} from "@primer/octicons-react";
import "./sidebar.css";
import { usePresetFilter } from "../../hooks/use-preset-filter";
import { useFilterContext } from "../../hooks/use-filter";
import {
  kPresetFilterTypes,
  repoFilter,
  type kPresetFilterType,
} from "../../../common/presets";

const kPresetFilterSettings: Record<
  kPresetFilterType,
  { name: string; icon: Icon }
> = {
  inbox: {
    name: "Inbox",
    icon: InboxIcon,
  },
  my_turn: {
    name: "My Turn",
    icon: GoalIcon,
  },
  involved: {
    name: "Involved",
    icon: CommentDiscussionIcon,
  },
};

export function Sidebar() {
  const { setFilter } = useFilterContext();
  const { presetFilters, repoNamespaces } = usePresetFilter();

  return (
    <ActionList>
      {presetFilters.map((filter) => {
        const Icon =
          kPresetFilterSettings[filter.type as kPresetFilterType].icon;
        return (
          <ActionList.Item
            key={filter.type}
            onSelect={() => {
              console.log("Setting filter:", filter.type);
              setFilter(kPresetFilterTypes[filter.type as kPresetFilterType]);
            }}
          >
            <ActionList.LeadingVisual>
              <Icon />
            </ActionList.LeadingVisual>
            {kPresetFilterSettings[filter.type as kPresetFilterType].name}
            <ActionList.TrailingVisual>
              <CounterLabel>{filter.unread_count}</CounterLabel>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        );
      })}
      <ActionList.Divider />
      {repoNamespaces.map((ns) => (
        <Fragment key={ns.owner}>
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
        </Fragment>
      ))}
    </ActionList>
  );
}

function repoNameFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[1] : fullName;
}
