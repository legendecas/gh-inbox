import { shell } from "electron";

import type { ShellEndpoint } from "../../common/ipc/shell.ts";
import type { IService, IpcHandle } from "../service-manager.ts";

export class ShellService implements IService, ShellEndpoint {
  namespace = "shell";

  wire(ipcHandle: IpcHandle) {
    ipcHandle.wire("openUrl", this.openUrl);
  }

  async openUrl(url: string) {
    shell.openExternal(url);
  }
}
