import type {} from "./ipc.ts";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/app";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
