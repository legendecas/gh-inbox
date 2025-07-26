import React from "react";
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";
import { Content } from "./content/content";

export function App() {
  return (
    <div className="flex flex-col">
      <div className='flex-1'>
        <Navbar />
      </div>
      <div className='flex-1 flex flex-row'>
        <Sidebar />
        <Content />
      </div>
    </div>
  );
}
