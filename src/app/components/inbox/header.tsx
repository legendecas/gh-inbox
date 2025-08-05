import { ArchiveIcon, CheckboxIcon, SyncIcon } from "@primer/octicons-react";
import { Button, ButtonGroup, IconButton, PageHeader } from "@primer/react";
import React from "react";

import { useCurrentEndpointContext } from "../../hooks/use-endpoints";

export function Header({
  selectedThreads,
  selectClosedThreads,
  refreshThreads,
}: {
  selectedThreads: Set<string>;
  selectClosedThreads: () => void;
  refreshThreads: () => void;
}) {
  const ctx = useCurrentEndpointContext();
  async function archiveThreads() {
    await window.ipc.invoke(
      "threads",
      "archive",
      ctx.endpointId,
      Array.from(selectedThreads),
    );
    refreshThreads();
  }

  return (
    <PageHeader role="banner" aria-label="Banner" className="w-full">
      <PageHeader.TitleArea>
        <PageHeader.Title>
          <div className="flex flex-row items-center gap-x-[8px]">
            <ButtonGroup>
              <IconButton
                icon={CheckboxIcon}
                aria-label="Select closed threads"
                onClick={selectClosedThreads}
              />

              <Button
                onClick={archiveThreads}
                leadingVisual={<ArchiveIcon size={16} />}
              >
                Archive
              </Button>
            </ButtonGroup>
          </div>
        </PageHeader.Title>
      </PageHeader.TitleArea>

      <PageHeader.LeadingAction></PageHeader.LeadingAction>

      <PageHeader.TrailingAction>
        <IconButton
          icon={SyncIcon}
          aria-label="Refresh"
          onClick={refreshThreads}
        />
      </PageHeader.TrailingAction>

      <PageHeader.Actions></PageHeader.Actions>
    </PageHeader>
  );
}
