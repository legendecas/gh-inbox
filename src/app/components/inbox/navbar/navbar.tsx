import { GearIcon } from "@primer/octicons-react";
import { ActionList, ActionMenu, Avatar, IconButton } from "@primer/react";
import React from "react";

import { kGitHubAvatarFallback } from "../../../../common/github-constants";
import { useCurrentEndpointContext } from "../../../hooks/use-current-endpoint";
import { useEndpointsContext } from "../../../hooks/use-endpoints";
import { usePathname } from "../../../hooks/use-location";
import "./navbar.css";
import { SearchBox } from "./search-box";

export function Navbar({ headerHeight }: { headerHeight: number }) {
  const [_pathname, setPathname] = usePathname();
  const { endpoints } = useEndpointsContext();
  const { endpointId, setEndpointId } = useCurrentEndpointContext();

  const handleSettingsClick = () => {
    setPathname("/settings");
  };

  return (
    <div
      className="navbar flex flex-row items-center"
      style={{ height: headerHeight }}
    >
      <div className="navbar-left flex flex-row items-center grow gap-x-[8px]">
        {endpoints.length === 1 ? (
          <Avatar
            src={kGitHubAvatarFallback}
            size={28}
            alt={endpoints[0].url}
          />
        ) : (
          <ActionMenu>
            <ActionMenu.Button>
              Endpoint: {endpoints.find((e) => e.id === endpointId)?.url}
            </ActionMenu.Button>
            <ActionMenu.Overlay style={{ minWidth: "max-content" }}>
              <ActionList>
                {endpoints.map((endpoint, index) => (
                  <ActionList.Item
                    key={endpoint.id}
                    onSelect={() => setEndpointId(endpoint.id)}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "2rem",
                      }}
                    >
                      <span>{endpoint.url}</span>
                      {index < 9 && <kbd>⌘{index + 1}</kbd>}
                    </span>
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
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
