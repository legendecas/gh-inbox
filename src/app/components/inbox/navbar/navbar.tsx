import { GearIcon } from "@primer/octicons-react";
import { ActionList, ActionMenu, IconButton } from "@primer/react";
import React from "react";

import {
  useCurrentEndpointContext,
  useEndpointsContext,
} from "../../../hooks/use-endpoints";
import { usePathname } from "../../../hooks/use-location";
import "./navbar.css";
import { SearchBox } from "./search-box";

export function Navbar() {
  const [_pathname, setPathname] = usePathname();
  const { endpoints } = useEndpointsContext();
  const { endpointId, setEndpointId } = useCurrentEndpointContext();

  const handleSettingsClick = () => {
    setPathname("/settings");
  };

  return (
    <div className="navbar flex flex-row">
      <div className="navbar-left flex flex-row grow gap-x-[8px]">
        <ActionMenu>
          <ActionMenu.Button>
            Endpoint: {endpoints.find((e) => e.id === endpointId)?.url}
          </ActionMenu.Button>
          <ActionMenu.Overlay>
            <ActionList>
              {endpoints.map((endpoint) => (
                <ActionList.Item
                  key={endpoint.id}
                  onSelect={() => setEndpointId(endpoint.id)}
                >
                  {endpoint.url}
                </ActionList.Item>
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
        <SearchBox />
      </div>
      <div className="navbar-right flex flex-row-reverse gap-x-[8px] ml-[8px]">
        <IconButton
          icon={GearIcon}
          aria-label="Settings"
          onClick={handleSettingsClick}
        />
      </div>
    </div>
  );
}
