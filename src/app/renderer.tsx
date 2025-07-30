import type {} from "./ipc.ts";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { AppContainer } from "./components/app/app.tsx";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <AppContainer />
  </StrictMode>,
);
