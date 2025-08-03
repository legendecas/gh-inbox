import React, { createContext, useContext, useState } from "react";

export const FilterContext = createContext({
  filter: "archived:false",
  setFilter: (_filter: string) => {
    /* no-op */
  },
});
export function useFilterContext() {
  return useContext(FilterContext);
}

export function FilterProvider({ children }: React.PropsWithChildren) {
  const [filter, setFilter] = useState("archived:false");
  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
}
