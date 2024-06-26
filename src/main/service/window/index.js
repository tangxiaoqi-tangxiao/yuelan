import { ipcMain ,app} from "electron";

const WM_INITMENU = 0x0116;

function WindowManage(MainWindow) {
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
      MainWindow.close();
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

export default WindowManage;