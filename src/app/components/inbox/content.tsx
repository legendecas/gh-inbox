import { Pagination } from "@primer/react";
import React, { useEffect, useState } from "react";

import { kPageSize } from "../../../common/presets";
import { useFilterContext } from "../../hooks/use-filter";
import { useThreadsContext } from "../../hooks/use-threads";
import "./content.css";
import { Header } from "./header";
import { ThreadItem } from "./thread-item";

const kOpenStates = ["open", "draft"];

export function Content() {
  const { currentPage, setCurrentPage } = useFilterContext();
  const { threads, totalCount } = useThreadsContext();
  const [selectedSet, setSelected] = useState<Set<string>>(new Set());

  const onThreadSelected = (threadId: string, checked: boolean) => {
    if (checked) {
      selectedSet.add(threadId);
    } else {
      selectedSet.delete(threadId);
    }
    setSelected(new Set(selectedSet));
  };

  const selectClosedThreads = () => {
    const closedThreads = threads.filter(
      (thread) => !kOpenStates.includes(thread.state),
    );
    closedThreads.forEach((thread) => {
      selectedSet.add(thread.id);
    });
    setSelected(new Set(selectedSet));
  };

  const threadIds = threads.map((thread) => thread.id).join(",");
  useEffect(() => {
    const visibleThreadIds = new Set(threadIds.split(","));
    setSelected(
      (selected) =>
        new Set([...selected].filter((id) => visibleThreadIds.has(id))),
    );
  }, [threadIds]);

  return (
    <div className="threads-content">
      <div className="threads-toolbar">
        <Header
          selectedThreads={selectedSet}
          selectClosedThreads={selectClosedThreads}
        />
      </div>

      <div className="threads-list">
        <table className="threads-table w-full">
          <tbody>
            {threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                selected={selectedSet.has(thread.id)}
                setSelected={onThreadSelected}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="threads-pagination">
        <Pagination
          pageCount={Math.ceil(totalCount / kPageSize)}
          currentPage={currentPage}
          onPageChange={(_event, number) => {
            setCurrentPage(number);
          }}
          showPages={{ narrow: false }}
        />
      </div>
    </div>
  );
}
