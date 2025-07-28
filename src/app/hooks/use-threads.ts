import { useEffect, useState } from "react";
import type { ThreadItem } from "../../common/ipc/threads.js";

export async function fetchThreads() {
  try {
    const threads = await window.ipc.invoke("threads", "list");
    console.log("Fetched threads:", threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
  }
}

export function useThreads() {
  const [threads, setThreads] = useState<ThreadItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("threads", "list");
        setThreads(data);
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetch();
  }, []);

  return threads;
}
