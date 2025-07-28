import React from "react";
import { useThreads } from "../../hooks/use-threads";
import { Header } from "./header";
import { ThreadItem } from "./thread-item";
import "./content.css";

export function Content() {
  const [threads, refreshThreads] = useThreads();
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
    <div className="content flex flex-col">
      <Header checkedThreads={checkedSet} refreshThreads={refreshThreads} />
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
    </div>
  );
}
