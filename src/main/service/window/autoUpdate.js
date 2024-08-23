import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';
import logger from '@main/utils/logger.js';

let IsCheckUpdates = false;

export async function autoUpdateApp(MainWindow) {
    IsCheckUpdates = true;
    // 每次启动自动更新检查更新版本
    autoUpdater.checkForUpdates();
    // autoUpdater.logger = logger;
    autoUpdater.disableWebInstaller = false;
    // 这个写成 false，写成 true 时，可能会报没权限更新
    autoUpdater.autoDownload = false;
    autoUpdater.on("error", (error) => {
        IsCheckUpdates = false;
        logger.error(["检查更新失败", error]);
    });
    // 当有可用更新的时候触发。 更新将自动下载。
    autoUpdater.on("update-available", (info) => {
        logger.info("检查到有更新，开始下载新版本");
        const { version } = info;
        logger.info(`最新版本为： ${version}`);
        // 这里做的是检测到更新，直接就下载
        autoUpdater.downloadUpdate();
    });
    // 当没有可用更新的时候触发，其实就是啥也不用做
    autoUpdater.on("update-not-available", () => {
        IsCheckUpdates = false;

        logger.info("没有可用更新");
    });
    // 下载更新包的进度，可以用于显示下载进度与前端交互等
    autoUpdater.on("download-progress", async (progress) => {
        logger.info(`总字节数：${progress.total} 目前为止已经下载的字节数：${progress.transferred} 下载进度： ${progress.percent}`);
    });
    // 在更新下载完成的时候触发。
    autoUpdater.on("update-downloaded", (res) => {
        IsCheckUpdates = false;
        logger.info("下载完毕, 提示安装更新", res);
        // 这里需要注意，Electron.dialog 想要使用，必须在 BrowserWindow 创建之后
        dialog
            .showMessageBox(MainWindow, {
                title: "更新应用",
                message: "已为您下载最新应用，点击确定马上替换为最新版本！",
            })
            .then(() => {
                logger.info("退出应用，安装开始！");
                // 重启应用并在下载后安装更新，它只应在发出 update-downloaded 这个事件后方可被调用。
                autoUpdater.quitAndInstall();
            });
    });
}

export async function CheckUpdates() {
    return new Promise((resolve) => {
        logger.info(["开始检查更新：", IsCheckUpdates]);
        if (IsCheckUpdates) {
            resolve(true);
        } else {
            // 禁用自动下载
            autoUpdater.autoDownload = false;

            autoUpdater.on('update-available', () => {
                logger.info('有可用的更新。');
                // 在这里可以添加逻辑来通知用户或自动下载更新
                resolve(true);
            });

            autoUpdater.on('update-not-available', () => {
                logger.info('当前没有可用的更新。');
                // 在这里可以添加逻辑来通知用户应用是最新的
                resolve(false);
            });

            autoUpdater.on('error', (error) => {
                logger.error(['检查更新时出错:', error]);
                // 可以在这里处理错误，例如提示用户检查失败
                resolve(false);
            });

            // 触发更新检查
            autoUpdater.checkForUpdates();
        }
    });
}