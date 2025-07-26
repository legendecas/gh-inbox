import { useEffect, useState } from "react";
import type { RepoNamespace } from "../../common/ipc/repos.js";

export async function fetchRepos() {
  try {
    const repos = await window.ipc.invoke("repos", "list");
    console.log("Fetched repos:", repos);
  } catch (error) {
    console.error("Error fetching repos:", error);
  }
}

export function useRepos() {
  const [repos, setRepos] = useState<RepoNamespace[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("repos", "list");
        setRepos(data);
      } catch (error) {
        console.error("Error fetching repos:", error);
      }
    };

    fetch();
  }, []);

  return repos;
}
