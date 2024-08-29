import { app, shell, BrowserWindow } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import RenderWindows from "@main/service/resourceWin/resourceWin";
import WindowManage from "./service/window/index";
import { MonitorFile } from "./service/resourceWin/webFile";
import { WebServer } from '@main/service/webServer/index.js';
import Core from '@main/service/core/index.js'
import { OpenHideParameter_Key } from '@main/utils/config';

//全局变量
let MainWindow = null;

//禁用GPU加速
app.disableHardwareAcceleration();

//单例
appSingleton();

//初始化
function initialize() {
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

    //创建窗口和处理窗口事件
    createWindowAndWindowEvent();

    // MainWindow.webContents.openDevTools();

    //创建资源窗口
    // RenderWindows.createResourceWin();

    //运行核心
    Core();

    //监听web文件
    // MonitorFile();

    //运行web服务
    WebServer();

    app.on("activate", function () {
      // 在 macOS 中，当点击停靠栏图标且没有其他窗口打开时，在应用程序中重新创建一个窗口是很常见的
      if (BrowserWindow.getAllWindows().length === 0) createWindowAndWindowEvent();
    });
  });
}

//创建窗口和处理窗口事件
function createWindowAndWindowEvent() {
  //创建主窗口
  MainWindow = createWindow();
  //处理窗口事件
  WindowManage(MainWindow);
  // 暴露全局窗口对象
  global.MainWindow = MainWindow;
}

//创建窗口
function createWindow() {
  // Create the browser window.
  const MainWindow = new BrowserWindow({
    minWidth: 990,
    minHeight: 620,
    width: 990,
    height: 620,
    show: false,
    // frame: false, //隐藏整个窗口的工具栏和标题栏
    // titleBarStyle: "hidden",//隐藏应用窗口标题栏
    fullscreenable: false,//禁用全屏模式
    title:"阅览",
    icon:icon,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      //electron-vitebytecodePlugin 仅适用于生产阶段构建并且只支持主进程和预加载脚本。
      //需要注意的是，预加载脚本需要禁用 sandbox 才能支持字节码，因为字节码是基于 Node 的 vm 模块实现。
      //从 Electron 20 开始，渲染器默认会被沙箱化，所以如果你想使用字节码来保护预加载脚本，你需要设置 sandbox: false

      //electron如果您的预加载脚本不依赖于 Node，则无需执行任何操作。
      //如果您的预加载脚本确实依赖于 Node，请重构它们以从渲染器中删除 Node 的使用，
      //或者为相关渲染器显式指定 sandbox： false
      //不依赖Node是指只能使用"electron/renderer"包
      sandbox: true,
      //关闭可以让网页服务器访问本地文件（打包软件需要关闭）
      webSecurity: false
    },
  });

  //等待渲染进程加载完成显示窗口
  MainWindow.on("ready-to-show", () => {
    //获取是否开机启动
    const { wasOpenedAtLogin } = app.getLoginItemSettings();
    if (process.platform == "win32") {
      if (process.argv.indexOf(OpenHideParameter_Key) < 0) {
        MainWindow.show();
      }
    } else if (process.platform == "darwin") {
      if (!wasOpenedAtLogin) {
        MainWindow.show();
      }
    } else {
      MainWindow.show();
    }
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

//单例
function appSingleton() {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // 当运行第二个实例时，这里将会被触发
      // 你可以将主窗口聚焦并处理其他需要的行为
      if (MainWindow) {
        MainWindow.show();
        if (MainWindow.isMinimized()) MainWindow.restore();
        MainWindow.focus();
      }
    });
    initialize();
  }
}