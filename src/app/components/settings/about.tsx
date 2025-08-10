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
          <p>The app is licensed under MIT. Use at your own risk.</p>
          <p>
            The project is not affiliated with GitHub, nor any API providers.
          </p>
          <p>
            The data is authorized under user's consent with user provided
            personal access tokens.
          </p>
          <p>
            All data is stored locally, and the app only communicates with the
            GitHub APIs.
          </p>
        </PageLayout.Content>
      </PageLayout>
    </>
  );
}
