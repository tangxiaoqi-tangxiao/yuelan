import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import RenderWindows from "@main/service/resourceWin/resourceWin";
import WindowManage from "./service/window/index";
import { MonitorFile } from "./service/resourceWin/webFile";
import WebServer from '@main/service/webServer/index.js';

function createWindow() {
  // Create the browser window.
  const MainWindow = new BrowserWindow({
    minWidth: 990,
    minHeight: 620,
    width: 990,
    height: 620,
    show: false,
    frame: false, //隐藏工具栏
    titleBarStyle: "hidden",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  //等待渲染进程加载完成显示窗口
  MainWindow.on("ready-to-show", () => {
    MainWindow.show();
  });

  // Electron 应用中拦截窗口打开请求，并将其重定向到外部浏览器，而不是在应用内部创建新的窗口
  MainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  //基于eonic-vite cli的渲染器的HMR。
  //加载远程URL进行开发或加载本地html文件进行生产。
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    MainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    MainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
  return MainWindow;
}

//当Electron完成时将调用此方法
//初始化并准备创建浏览器窗口。
//某些API只能在此事件发生后使用。
app.whenReady().then(() => {
  //  为Windows设置应用用户模型ID
  electronApp.setAppUserModelId("yuelan");

  //F12在开发中默认打开或关闭DevTools
  //并忽略生产中的Command dOrControl+R。
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  //创建主窗口
  let MainWindow = createWindow();

  //创建资源窗口
  RenderWindows.createResourceWin();

  //处理窗口事件
  WindowManage(MainWindow);

  //监听web文件
  // MonitorFile();

  //运行web服务
  WebServer();

  app.on("activate", function () {
    // 在 macOS 中，当点击停靠栏图标且没有其他窗口打开时，在应用程序中重新创建一个窗口是很常见的
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口都关闭时退出程序，但 macOS 除外。在 macOS 上，应用程序及其菜单栏通常保持活动状态，直到用户明确地使用 Cmd + Q 快捷键退出。
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});