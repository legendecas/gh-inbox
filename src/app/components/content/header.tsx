import { Button } from "@primer/react";
import React from "react";

import { useAppContext } from "../../hooks/use-app";

export function Header({
  checkedThreads,
  refreshThreads,
}: {
  checkedThreads: Set<string>;
  refreshThreads: () => void;
}) {
  const ctx = useAppContext();
  async function archiveThreads() {
    await window.ipc.invoke(
      "threads",
      "archive",
      ctx.endpointId,
      Array.from(checkedThreads),
    );
    refreshThreads();
  }

  return (
    <div className="header flex flex-col items-start">
      <Button onClick={archiveThreads}>Archive</Button>
    </div>
  );
}
