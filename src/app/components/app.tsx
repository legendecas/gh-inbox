import React from "react";

async function fetchNotifications() {
  try {
    const notifications = await window.ipc.invoke("threads", "list");
    console.log("Fetched notifications:", notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

export function App() {
  return (
    <div>
      <h1>Hello from Electron renderer!</h1>
      <p>👋</p>
      <button onClick={fetchNotifications}>Fetch Notifications</button>
    </div>
  );
}
