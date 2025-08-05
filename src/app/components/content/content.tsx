import { PageLayout, Pagination } from "@primer/react";
import React, { useEffect, useState } from "react";

import { kPageSize } from "../../../common/presets";
import { useFilterContext } from "../../hooks/use-filter";
import { useThreads } from "../../hooks/use-threads";
import "./content.css";
import { Header } from "./header";
import { ThreadItem } from "./thread-item";

export function Content() {
  const { filter, currentPage, setCurrentPage } = useFilterContext();
  const [threads, totalCount, refreshThreads] = useThreads(
    filter,
    currentPage,
    kPageSize,
  );
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
    const closedThreads = threads.filter((thread) => thread.state !== "open");
    closedThreads.forEach((thread) => {
      selectedSet.add(thread.id);
    });
    setSelected(new Set(selectedSet));
  };

  useEffect(() => {
    setSelected(new Set());
  }, [threads]);

  return (
    <PageLayout
      containerWidth="full"
      padding="none"
      columnGap="condensed"
      rowGap="condensed"
    >
      <PageLayout.Header>
        <Header
          selectedThreads={selectedSet}
          selectClosedThreads={selectClosedThreads}
          refreshThreads={refreshThreads}
        />
      </PageLayout.Header>
      <PageLayout.Content>
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

        <Pagination
          pageCount={Math.ceil(totalCount / kPageSize)}
          currentPage={currentPage}
          onPageChange={(_event, number) => {
            setCurrentPage(number);
          }}
          showPages={{ narrow: false }}
        />
      </PageLayout.Content>
    </PageLayout>
  );
}
