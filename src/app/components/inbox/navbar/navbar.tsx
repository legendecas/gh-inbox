import { GearIcon } from "@primer/octicons-react";
import { IconButton } from "@primer/react";
import React from "react";

import { usePathname } from "../../../hooks/use-pathname";
import "./navbar.css";
import { SearchBox } from "./search-box";

export function Navbar() {
  const [_pathname, setPathname] = usePathname();

  const handleSettingsClick = () => {
    setPathname("/settings");
  };

  return (
    <div className="navbar flex flex-row">
      <div className="navbar-left flex flex-row grow">
        <SearchBox />
      </div>
      <div className="navbar-right flex flex-row-reverse ml-[8px]">
        <IconButton
          icon={GearIcon}
          aria-label="Settings"
          onClick={handleSettingsClick}
        />
      </div>
    </div>
  );
}
