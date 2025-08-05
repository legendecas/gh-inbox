import { NavList, SplitPageLayout } from "@primer/react";
import React, { useEffect, useState } from "react";

import { About } from "./about";
import { Endpoints } from "./endpoints";
import { Navbar } from "./navbar/navbar";

function Content({ currentHash }: { currentHash: string }) {
  switch (currentHash) {
    case "#about":
      return <About />;
    default:
      return <Endpoints />;
  }
}

export function Settings() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  useEffect(() => {
    if (currentHash === "") {
      setCurrentHash("#endpoints");
    }

    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <>
      <SplitPageLayout>
        <SplitPageLayout.Header padding="none">
          <Navbar />
        </SplitPageLayout.Header>
        <SplitPageLayout.Pane position="start" padding="none">
          <NavList aria-label="Navigation">
            <NavList.Item
              href="#endpoints"
              aria-current={currentHash === "#endpoints"}
            >
              Endpoints
            </NavList.Item>
            <NavList.Item href="#about" aria-current={currentHash === "#about"}>
              About
            </NavList.Item>
          </NavList>
        </SplitPageLayout.Pane>
        <SplitPageLayout.Content padding="condensed" width="full">
          <Content currentHash={currentHash} />
        </SplitPageLayout.Content>
      </SplitPageLayout>
    </>
  );
}
