import { ArchiveIcon, CheckboxIcon, SyncIcon } from "@primer/octicons-react";
import { Button, ButtonGroup, IconButton } from "@primer/react";
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
    <div className="header flex flex-row items-start">
      <ButtonGroup className="mr-[8px]">
        <Button
          onClick={archiveThreads}
          leadingVisual={<ArchiveIcon size={16} />}
        >
          Archive
        </Button>

        <IconButton
          icon={CheckboxIcon}
          aria-label="Select closed threads"
          onClick={selectClosedThreads}
        />
      </ButtonGroup>
      <IconButton
        icon={SyncIcon}
        aria-label="Refresh"
        onClick={refreshThreads}
        className="mr-[8px]"
      />
    </div>
  );
}
