import React from "react";
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";
import { Content } from "./content/content";

export function App() {
  return (
    <div className="app">
      <Navbar />
      <Sidebar />
      <Content />
    </div>
  );
}
