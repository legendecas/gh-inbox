import React from "react";
import { Button } from "@primer/react";

export function Header({
  checkedThreads,
  refreshThreads,
}: {
  checkedThreads: Set<string>;
  refreshThreads: () => void;
}) {
  async function archiveThreads() {
    await window.ipc.invoke("threads", "archive", Array.from(checkedThreads));
    refreshThreads();
  }

  return (
    <div className="header flex flex-col items-start">
      <Button onClick={archiveThreads}>Archive</Button>
    </div>
  );
}
