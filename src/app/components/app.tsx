import React from "react";

import "@primer/primitives/dist/css/functional/themes/light.css";
import { BaseStyles, ThemeProvider } from "@primer/react";

import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";
import { Content } from "./content/content";

export function App() {
  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <Navbar />
      </div>
      <div className="flex-1 flex flex-row">
        <Sidebar />
        <Content />
      </div>
    </div>
  );
}

export function AppContainer() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <App />
      </BaseStyles>
    </ThemeProvider>
  );
}
