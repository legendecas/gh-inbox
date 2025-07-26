import { useEffect, useState } from 'react';
import type { Thread } from "../../generated/prisma/index.js";

export async function fetchThreads() {
  try {
    const threads = await window.ipc.invoke("threads", "list");
    console.log("Fetched threads:", threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
  }
}

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke<Thread[]>("threads", "list");
        setThreads(data);
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetch();
  }, []);

  return threads;
}
