import React, { createContext, useContext } from "react";

import { kPageSize } from "../../common/presets";
import { useQueryParam } from "./use-location";

export const FilterContext = createContext({
  filter: "",
  currentPage: 1,
  pageSize: kPageSize,
  setCurrentPage: (_page: number) => {
    /* no-op */
  },
  setFilter: (_filter: string) => {
    /* no-op */
  },
});
export function useFilterContext() {
  return useContext(FilterContext);
}

export function FilterProvider({ children }: React.PropsWithChildren) {
  const [filter, setFilter] = useQueryParam("q", "");

  const [currentPage, setCurrentPage] = useQueryParam("page", 1, {
    serialize: (value: number) => value.toString(),
    deserialize: (value: string) => parseInt(value, 10),
  });

  function setFilterAndClearPage(newFilter: string) {
    setFilter(newFilter);
    setCurrentPage(1);
  }

  return (
    <FilterContext.Provider
      value={{
        filter,
        setFilter: setFilterAndClearPage,
        currentPage,
        setCurrentPage,
        pageSize: kPageSize,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
