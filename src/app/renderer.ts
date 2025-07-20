import type {} from "./ipc.ts";

const information = document.getElementById("info")!;
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

async function fetchNotifications() {
  try {
    const notifications = await window.ipc.invoke("threads", "list");
    console.log("Fetched notifications:", notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

const btn = document.getElementById("fetch-notifications");
if (btn) {
  btn.addEventListener("click", fetchNotifications);
}
