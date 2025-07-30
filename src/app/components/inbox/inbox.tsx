import { SplitPageLayout } from "@primer/react";
import React from "react";
import { Navbar } from "../navbar/navbar";
import { Sidebar } from "../sidebar/sidebar";
import { Content } from "../content/content";

export function Inbox() {
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
