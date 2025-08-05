import { ArrowLeftIcon } from "@primer/octicons-react";
import { IconButton } from "@primer/react";
import React from "react";

import { usePathname } from "../../../hooks/use-location";
import "./navbar.css";

export function Navbar() {
  const [_pathname, setPathname] = usePathname();

  const handleBack = () => {
    setPathname("/");
  };

  return (
    <div className="navbar flex flex-row">
      <div className="navbar-left flex flex-row grow">
        <IconButton
          aria-label="Back"
          icon={ArrowLeftIcon}
          onClick={handleBack}
        />
      </div>
      <div className="navbar-right flex flex-row-reverse ml-[8px]"></div>
    </div>
  );
}
