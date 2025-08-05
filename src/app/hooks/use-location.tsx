import React, { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext({
  pathname: "",
  updatePathname: (_pathname: string) => {
    /* no-op */
  },

  queryParams: {} as Record<string, string>,
  updateQueryParams: (_params: Record<string, string>) => {
    /* no-op */
  },
});

function fromUrlSearchParams(params: URLSearchParams): Record<string, string> {
  const paramsObject: Record<string, string> = {};
  params.forEach((value, key) => {
    paramsObject[key] = value;
  });
  return paramsObject;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [pathname, setPathname] = useState<string>("");

  useEffect(() => {
    console.log("Initializing location from URL", window.location.href);
    setQueryParams(
      fromUrlSearchParams(new URLSearchParams(window.location.search)),
    );
    setPathname(window.location.pathname);
  }, []);

  function updatePathname(newPathname: string) {
    const url = new URL(newPathname, window.location.href);
    console.log("Updating pathname:", url.href);
    window.history.pushState(null, "", newPathname);
    setQueryParams(fromUrlSearchParams(url.searchParams));
    setPathname(url.pathname);
  }

  function updateQueryParams(newParams: Record<string, string>) {
    console.log("Updating query params:", newParams, window.location.search);
    const params = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
    const paramsObject: Record<string, string> = Object.fromEntries(
      params.entries(),
    );
    setQueryParams(paramsObject);
  }

  return (
    <LocationContext.Provider
      value={{ pathname, updatePathname, queryParams, updateQueryParams }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function usePathname() {
  const { pathname, updatePathname } = useContext(LocationContext);
  return [pathname, updatePathname] as const;
}

export function useQueryParams() {
  const { queryParams, updateQueryParams } = useContext(LocationContext);
  return [queryParams, updateQueryParams] as const;
}

interface SerDes<T> {
  serialize: (value: T) => string;
  deserialize: (value: string) => T;
}
const kDefaultSerDes: SerDes<string> = {
  serialize: (value: string) => value,
  deserialize: (value: string) => value,
};
export function useQueryParam<T = string>(
  key: string,
  defaultValue: T,
  serDes: SerDes<T> = kDefaultSerDes as unknown as SerDes<T>,
): [T, (value: T) => void] {
  const [queryParams, updateQueryParams] = useQueryParams();

  function setQueryParam(value: T) {
    updateQueryParams({ [key]: serDes.serialize(value) });
  }

  return [
    queryParams[key] ? serDes.deserialize(queryParams[key]) : defaultValue,
    setQueryParam,
  ];
}
