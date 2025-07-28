import React from "react";

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
      <button className="archive-button" onClick={archiveThreads}>
        Archive
      </button>
    </div>
  );
}
