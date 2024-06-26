import chokidar from "chokidar";
import path from "path";
import RenderWindows from "./resourceWin";
import { app } from "electron";

export function MonitorFile() {
  let folderToWatch = app.getPath("downloads");
  if (folderToWatch == null) {
    return;
  }

  let a = new RenderWindows();
  chokidar.watch(folderToWatch, { ignoreInitial: true }).on("add", (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== ".html" && ext !== ".mhtml") {
      return;
    }
    a.Analysis(filePath);
  });

  console.log(`开始监听文件夹: ${folderToWatch}`);
}
