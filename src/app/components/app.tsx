import React from "react";

import "@primer/primitives/dist/css/functional/themes/light.css";
import { BaseStyles, SplitPageLayout, ThemeProvider } from "@primer/react";

import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";
import { Content } from "./content/content";

export function App() {
  return (
    <SplitPageLayout>
      <SplitPageLayout.Header padding="none">
        <Navbar />
      </SplitPageLayout.Header>
      <SplitPageLayout.Pane position="start" padding="none">
        <Sidebar />
      </SplitPageLayout.Pane>
      <SplitPageLayout.Content padding="condensed" width="full">
        <Content />
      </SplitPageLayout.Content>
    </SplitPageLayout>
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
