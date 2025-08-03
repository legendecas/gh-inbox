import React, { Fragment } from "react";
import { Avatar, CounterLabel, ActionList, Truncate } from "@primer/react";
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
  kPresetFilterSearches,
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
  const { filter, setFilter } = useFilterContext();
  const { presetFilters, repoNamespaces } = usePresetFilter();

  return (
    <ActionList>
      {presetFilters.map((pf) => {
        const Icon = kPresetFilterSettings[pf.type as kPresetFilterType].icon;
        return (
          <ActionList.Item
            key={pf.type}
            active={
              kPresetFilterSearches[pf.type as kPresetFilterType] === filter
            }
            onSelect={() => {
              setFilter(kPresetFilterSearches[pf.type as kPresetFilterType]);
            }}
          >
            <ActionList.LeadingVisual>
              <Icon />
            </ActionList.LeadingVisual>
            {kPresetFilterSettings[pf.type as kPresetFilterType].name}
            <ActionList.TrailingVisual>
              <CounterLabel>{pf.unread_count}</CounterLabel>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        );
      })}
      <ActionList.Divider />
      {repoNamespaces.map((ns) => {
        const ownerFilter = `owner:${ns.owner}`;
        return (
          <Fragment key={ns.owner}>
            <ActionList.Item
              key={ns.owner}
              active={ownerFilter === filter}
              onSelect={() => {
                setFilter(ownerFilter);
              }}
            >
              <ActionList.LeadingVisual>
                <Avatar
                  square
                  src={ns.avatar_url}
                  alt={`${ns.owner}'s avatar`}
                />
              </ActionList.LeadingVisual>
              {ns.owner}
            </ActionList.Item>

            {ns.repos.map((repo) => {
              const repoName = repoNameFromFullName(repo.full_name);
              const repoFilter = `repo:${repo.full_name}`;
              return (
                <ActionList.Item
                  key={repo.id}
                  active={repoFilter === filter}
                  onSelect={() => {
                    setFilter(repoFilter);
                  }}
                >
                  <ActionList.LeadingVisual>
                    {repo.private ? <LockIcon fill="#dbab09" /> : <RepoIcon />}
                  </ActionList.LeadingVisual>
                  <Truncate title={repoName} maxWidth="100%">
                    {repoName}
                  </Truncate>
                  <ActionList.TrailingVisual>
                    <CounterLabel>{repo.unread_count}</CounterLabel>
                  </ActionList.TrailingVisual>
                </ActionList.Item>
              );
            })}
          </Fragment>
        );
      })}
    </ActionList>
  );
}

function repoNameFromFullName(fullName: string): string {
  const parts = fullName.split("/");
  return parts.length > 1 ? parts[1] : fullName;
}
