import React from "react";
import "./navbar.css";
import { SearchBox } from './search-box';

export function Navbar() {
  return (
    <div className='navbar'>
      <SearchBox />
    </div>
  );
}
