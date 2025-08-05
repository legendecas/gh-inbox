import { useEffect, useState } from "react";

export function usePathname() {
  const [pathname, setPathname] = useState<string>("");

  useEffect(() => {
    console.log("Initializing pathname from URL", window.location.pathname);
    setPathname(window.location.pathname);
  }, []);

  function updatePathname(newPathname: string) {
    console.log("Updating pathname:", newPathname);
    window.history.pushState(null, "", newPathname);
    setPathname(newPathname);
  }

  return [pathname, updatePathname] as const;
}
