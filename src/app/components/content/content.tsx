import React from "react";
import { useThreads } from "../../hooks/use-threads";
import { Header } from "./header";
import { ThreadItem } from "./thread-item";
import "./content.css";

export function Content() {
  const threads = useThreads();
  return (
    <div className="content flex flex-col">
      <Header />
      <table className="threads-table">
        <tbody>
          {threads.map((thread) => (
            <ThreadItem key={thread.id} thread={thread} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
