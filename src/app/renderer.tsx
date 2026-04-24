import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import superjson from "superjson";

import { AppContainer } from "./components/app/app.tsx";
import type {} from "./ipc.ts";

// In a plain browser (no Electron preload), install an HTTP-based IPC shim.
if (typeof window.ipc === "undefined") {
  window.ipc = {
    async invoke(namespace: string, channel: string, ...args: unknown[]) {
      if (namespace === "shell" && channel === "openUrl") {
        window.open(args[0] as string, "_blank");
        return;
      }
      const res = await fetch("/api/ipc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace, channel, args }),
      });
      const { result, error } = superjson.parse<any>(await res.text());
      if (!res.ok) throw new Error(error);
      return result;
    },
  } as typeof window.ipc;
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <AppContainer />
  </StrictMode>,
);
