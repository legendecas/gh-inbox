import React from "react";
import { useThreads } from "../../hooks/use-threads";
import { Header } from "./header";
import { ThreadItem } from "./thread-item";
import "./content.css";
import { PageLayout, Pagination } from "@primer/react";
import { kPageSize } from "../../../common/presets";

export function Content() {
  const [currentPage, setCurrentPage] = React.useState(1);

  const [threads, totalCount, refreshThreads] = useThreads(
    currentPage,
    kPageSize,
  );
  const [checkedSet, setChecked] = React.useState<Set<string>>(new Set());

  const onChecked = (threadId: string, checked: boolean) => {
    if (checked) {
      checkedSet.add(threadId);
    } else {
      checkedSet.delete(threadId);
    }
    setChecked(new Set(checkedSet));
  };

  return (
    <PageLayout
      containerWidth="full"
      padding="none"
      columnGap="condensed"
      rowGap="condensed"
    >
      <PageLayout.Header>
        <Header checkedThreads={checkedSet} refreshThreads={refreshThreads} />
      </PageLayout.Header>
      <PageLayout.Content>
        <table className="threads-table">
          <tbody>
            {threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                checked={checkedSet.has(thread.id)}
                setChecked={onChecked}
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
