import { ipcMain, app, Tray, Menu } from "electron";
import path from 'path'

const WM_INITMENU = 0x0116;

function WindowManage(MainWindow) {
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
}

export default WindowManage;