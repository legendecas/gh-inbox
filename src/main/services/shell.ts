import type { IpcHandle, IService } from "../service-manager.ts";
import type { ShellEndpoint } from "../../common/ipc/shell.ts";
import { shell } from "electron";

export class ShellService implements IService, ShellEndpoint {
  namespace = "shell";

  wire(ipcHandle: IpcHandle) {
    ipcHandle.wire("openUrl", this.openUrl);
  }

  async openUrl(url: string) {
    shell.openExternal(url);
  }
}
