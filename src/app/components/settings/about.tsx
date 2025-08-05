import { Heading, PageLayout } from "@primer/react";
import React from "react";

export function About() {
  return (
    <>
      <PageLayout>
        <PageLayout.Header>
          <Heading>About</Heading>
        </PageLayout.Header>
        <PageLayout.Content>
          <p>The project is licensed under MIT.</p>
        </PageLayout.Content>
      </PageLayout>
    </>
  );
}
