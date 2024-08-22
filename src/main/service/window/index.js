import { ipcMain, app, Tray, Menu } from "electron";
import path from 'path';
import { SaveWindowSize, GetWindowSize, GetBootStart, SaveBootStart } from '@main/service/core/System';
import logger from '@main/utils/logger';
import { autoUpdateApp } from '@main/service/window/autoUpdate';


const WM_INITMENU = 0x0116;

async function WindowManage(MainWindow) {
  //托盘
  {
    // 创建托盘图标
    const iconPath = path.join(__dirname, '../../resources/icon.png'); // 你的托盘图标路径
    let tray = new Tray(iconPath);

    // 托盘图标菜单
    const contextMenu = Menu.buildFromTemplate([
      { label: '显示', click: () => { MainWindow.show(); } },
      { label: '退出', click: () => { app.quit(); } }
    ]);

    tray.setToolTip('阅览');
    tray.setContextMenu(contextMenu);

    // 单击托盘图标时显示窗口
    tray.on('click', () => {
      MainWindow.isVisible() ? MainWindow.hide() : MainWindow.show();
    });
    // 退出时销毁托盘图标
    app.on('before-quit', () => {
      tray.destroy();
    });
  }

  //退出程序
  {
    // 当所有窗口都关闭时退出程序，但 macOS 除外。在 macOS 上，应用程序及其菜单栏通常保持活动状态，直到用户明确地使用 Cmd + Q 快捷键退出。
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
  }

  //窗口
  {
    // 监听窗口最大化和还原，更新图标
    ipcMain.on("index_WindowButton", (event, arg) => {
      if (arg == "max") {
        if (MainWindow.isMaximized()) {
          // 为true表示窗口已最大化
          MainWindow.restore(); // 将窗口恢复为之前的状态
        } else {
          MainWindow.maximize();
        }
      } else if (arg == "min") {
        MainWindow.minimize();
      } else if (arg == "close") {
        MainWindow.hide();
      }
    });

    //监听最大化,改变图标
    MainWindow.on("maximize", () => {
      MainWindow.webContents.send("index_UpdateIcon", true);
    });
    // 监听还原按钮点击事件，改变图标
    MainWindow.on("unmaximize", () => {
      MainWindow.webContents.send("index_UpdateIcon", false);
    });

    //禁用可拖拽区域系统菜单
    MainWindow.hookWindowMessage(WM_INITMENU, () => {
      MainWindow.setEnabled(false);
      MainWindow.setEnabled(true);
    });
  }

  //监听窗口大小
  {
    let windowSize = await GetWindowSize();
    if (windowSize) {
      const [width, height] = JSON.parse(windowSize.Value);
      MainWindow.setContentSize(width, height);
    }
    // 监听窗口大小改变事件  
    MainWindow.on('resized', () => {
      const Size = MainWindow.getSize();
      SaveWindowSize(JSON.stringify(Size));
    });
  }

  //开机自启动
  // {
  //   if (app.isPackaged) {
  //     let BootStart = await GetBootStart();
  //     const ex = process.execPath;
  //     if (BootStart) {
  //       let bool = false;
  //       if (BootStart.Value == "1") {
  //         bool = true;
  //       }
  //       app.setLoginItemSettings({
  //         openAtLogin: bool, // Boolean 在登录时启动应用
  //         openAsHidden: true, // Boolean (可选) mac 表示以隐藏的方式启动应用。~~~~
  //         path: ex, //String (可选) Windows - 在登录时启动的可执行文件。默认为 process.execPath.
  //         args: ["--OpenHide"] //String Windows - 要传递给可执行文件的命令行参数。默认为空数组。注意用引号将路径换行。
  //       });
  //     } else {
  //       SaveBootStart(false);
  //     }
  //     logger.info("开机自启动:" + ex);
  //   }
  // }

  //检查更新
  {
    // 检查更新
    autoUpdateApp();
  }
}

export default WindowManage;