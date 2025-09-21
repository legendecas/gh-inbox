import {
  ArchiveIcon,
  BookmarkIcon,
  CodeReviewIcon,
  CommentDiscussionIcon,
  GoalIcon,
  type Icon,
  InboxIcon,
  LockIcon,
  MentionIcon,
  PersonIcon,
  RepoIcon,
  SearchIcon,
} from "@primer/octicons-react";
import { ActionList, Avatar, CounterLabel, Truncate } from "@primer/react";
import React, { Fragment } from "react";

import { kGitHubAvatarFallback } from "../../../../common/github-constants";
import {
  kPresetFilterSearches,
  type kPresetFilterType,
} from "../../../../common/presets";
import { useFilterContext } from "../../../hooks/use-filter";
import { usePresetFilter } from "../../../hooks/use-preset-filter";
import "./sidebar.css";

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
  bookmarked: {
    name: "Bookmarked",
    icon: BookmarkIcon,
  },
  review_requested: {
    name: "Review Requested",
    icon: CodeReviewIcon,
  },
  assigned: {
    name: "Assigned",
    icon: PersonIcon,
  },
  mention: {
    name: "Mention",
    icon: MentionIcon,
  },
  archivable: {
    name: "Archivable",
    icon: ArchiveIcon,
  },
};

export function Sidebar() {
  const { filter, setFilter } = useFilterContext();
  const { presetFilters, searches, repoNamespaces } = usePresetFilter();

  const presetFilterMap = Object.fromEntries(
    presetFilters.map((pf) => [pf.type, pf]),
  );

  return (
    <ActionList>
      {(["inbox", "my_turn", "involved", "bookmarked"] as const).map((type) => {
        if (presetFilterMap[type] == null) return null;
        const Icon = kPresetFilterSettings[type].icon;
        return (
          <ActionList.Item
            key={type}
            active={kPresetFilterSearches[type] === filter}
            onSelect={() => {
              setFilter(kPresetFilterSearches[type]);
            }}
          >
            <ActionList.LeadingVisual>
              <Icon />
            </ActionList.LeadingVisual>
            {kPresetFilterSettings[type].name}
            <ActionList.TrailingVisual>
              <CounterLabel>{presetFilterMap[type].unread_count}</CounterLabel>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        );
      })}

      {searches.length > 0 ? <ActionList.Divider /> : null}
      {searches.map((sp) => {
        return (
          <ActionList.Item
            key={sp.id}
            active={sp.query === filter}
            onSelect={() => {
              setFilter(sp.query);
            }}
          >
            <ActionList.LeadingVisual>
              <SearchIcon />
            </ActionList.LeadingVisual>
            {sp.name}
            <ActionList.TrailingVisual>
              <CounterLabel>{sp.count}</CounterLabel>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        );
      })}

      <ActionList.Divider />
      {(["assigned", "review_requested", "mention", "archivable"] as const).map(
        (type) => {
          if (presetFilterMap[type] == null) return null;
          const Icon = kPresetFilterSettings[type].icon;
          return (
            <ActionList.Item
              key={type}
              active={kPresetFilterSearches[type] === filter}
              onSelect={() => {
                setFilter(kPresetFilterSearches[type]);
              }}
            >
              <ActionList.LeadingVisual>
                <Icon />
              </ActionList.LeadingVisual>
              {kPresetFilterSettings[type].name}
              <ActionList.TrailingVisual>
                <CounterLabel>
                  {presetFilterMap[type].unread_count}
                </CounterLabel>
              </ActionList.TrailingVisual>
            </ActionList.Item>
          );
        },
      )}

      {repoNamespaces.length > 0 ? <ActionList.Divider /> : null}
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
                  onError={(event) => {
                    (event.target as HTMLImageElement).src =
                      kGitHubAvatarFallback;
                  }}
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
