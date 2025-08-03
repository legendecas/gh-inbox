import React, { createContext, useContext, useState } from "react";
import { useQueryParam } from "./use-query-params";

export const FilterContext = createContext({
  filter: "",
  currentPage: 1,
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
  const [filter, setFilter] = useState("");

  const [currentPage, setCurrentPage] = useQueryParam(
    "page",
    {
      serialize: (value: number) => value.toString(),
      deserialize: (value: string) => parseInt(value, 10),
    },
    1,
  );

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
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
