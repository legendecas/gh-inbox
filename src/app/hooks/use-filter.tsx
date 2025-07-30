import React, { createContext, useContext, useState } from "react";
import { kDefaultFilter, type ThreadFilter } from "../../common/presets";

export const FilterContext = createContext({
  filter: kDefaultFilter,
  setFilter: (_filter: ThreadFilter) => {
    /* no-op */
  },
});
export function useFilterContext() {
  return useContext(FilterContext);
}

export function FilterProvider({ children }: React.PropsWithChildren) {
  const [filter, setFilter] = useState(kDefaultFilter);
  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
}
