import { ArchiveIcon, CheckboxIcon, SyncIcon } from "@primer/octicons-react";
import { Button, ButtonGroup } from "@primer/react";
import React from "react";

import { useAppContext } from "../../hooks/use-app";

export function Header({
  selectedThreads,
  selectClosedThreads,
  refreshThreads,
}: {
  selectedThreads: Set<string>;
  selectClosedThreads: () => void;
  refreshThreads: () => void;
}) {
  const ctx = useAppContext();
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
        <Button
          onClick={selectClosedThreads}
          leadingVisual={<CheckboxIcon size={16} />}
        >
          Closed
        </Button>
      </ButtonGroup>
      <Button onClick={refreshThreads} className="mr-[8px]">
        <SyncIcon size={16} />
      </Button>
    </div>
  );
}
