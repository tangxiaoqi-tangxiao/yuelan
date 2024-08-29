import { ipcMain, app, shell } from "electron";
import db from '@main/utils/sqliteHelper';
import { UUID } from '@main/utils/globalVariable';
import open, { apps } from 'open';
import { BootStart_Key, GPU_Key, WebServerPort_Key, OpenHideParameter_Key } from '@main/utils/config';
import fse from 'fs-extra';
import { resourcesPath } from '@main/utils/globalVariable.js';
import logger from '@main/utils/logger.js';
import path from 'path';


function initialization() {
    ipcMain.handle('index:System:BootStart', async (event, data) => BootStart(data));
    ipcMain.handle('index:System:GetBootStart', async (event) => GetBootStart());
    ipcMain.handle('index:System:GetGPU', async (event) => GetGPU());
    ipcMain.handle('index:System:SaveGPU', async (event, data) => SaveGPU(data));
    ipcMain.handle('index:System:OpenWebServerPort', async (event, data) => await OpenWebServerPort(data));
    ipcMain.handle('index:System:OpenLogs', (event) => OpenLogs());
}

async function SaveWindowSize(params) {
    let result = await GetWindowSize();
    if (result) {
        db.run(`UPDATE "Window" SET "Value" = ? WHERE "KEY"=?`, [params, "WindowSize"]);
    } else {
        db.run(`INSERT INTO "Window" VALUES(NULL,?,?)`, ["WindowSize", params]);
    }
}

async function GetWindowSize() {
    let model = await db.get(`SELECT * FROM "Window" WHERE "Key"='WindowSize'`, []);
    return model;
}

function BootStart(bool) {
    const ex = process.execPath;
    app.setLoginItemSettings({
        openAtLogin: bool, // Boolean 在登录时启动应用
        openAsHidden: true, // Boolean (可选) mac 表示以隐藏的方式启动应用。~~~~
        path: ex, //String (可选) Windows - 在登录时启动的可执行文件。默认为 process.execPath.
        args: [OpenHideParameter_Key]//String Windows - 要传递给可执行文件的命令行参数。默认为空数组。注意用引号将路径换行。
    });
    //更新是否自启动
    SaveBootStart(bool);
}

async function GetBootStart() {
    const key = BootStart_Key;
    let model = await db.get(`SELECT * FROM "Window" WHERE "Key"=?`, [key]);
    return model;
}

async function SaveBootStart(bool) {
    bool = bool ? "1" : "0";
    const key = BootStart_Key;
    let result = await GetBootStart();
    if (result) {
        db.run(`UPDATE "Window" SET "Value" = ? WHERE "KEY"=?`, [bool, key]);
    } else {
        db.run(`INSERT INTO "Window" VALUES(NULL,?,?)`, [key, bool]);
    }
}

async function GetGPU() {
    const key = GPU_Key;
    let model = await db.get(`SELECT * FROM "Window" WHERE "Key"=?`, [key]);
    return model;
}

async function SaveGPU(bool) {
    const key = GPU_Key;
    let result = await GetGPU();
    if (result) {
        db.run(`UPDATE "Window" SET "Value" = ? WHERE "KEY"=?`, [bool, key]);
    } else {
        db.run(`INSERT INTO "Window" VALUES(NULL,?,?)`, [key, bool]);
    }
}

async function GetWebServerPort() {
    const key = WebServerPort_Key;
    let model = await db.get(`SELECT * FROM "Window" WHERE "Key"=?`, [key]);
    return model;
}

async function SaveWebServerPort(Port) {
    const key = WebServerPort_Key;
    Port = String(Port);
    let result = await GetWebServerPort();
    if (result) {
        db.run(`UPDATE "Window" SET "Value" = ? WHERE "KEY"=?`, [Port, key]);
    } else {
        db.run(`INSERT INTO "Window" VALUES(NULL,?,?)`, [key, Port]);
    }
}

async function OpenWebServerPort(data) {
    let browser = null;
    switch (data) {
        case "1":
            browser = apps.edge;
            break;
        case "2":
            browser = apps.chrome;
            break;
        default:
            browser = apps.browser;
            break;
    }
    let model = await GetWebServerPort();
    console.log(`http://localhost:${model.Value}?uuid=${UUID}`);
    open(`http://localhost:${model.Value}?uuid=${UUID}`, { app: { name: browser } }).then(() => {
        console.log('打开成功');
    }).catch((err) => {
        console.log(err);
    });
}

function OpenLogs() {
    let logspath = path.join(resourcesPath, 'logs');

    logger.info(`打开日志文件地址：${logspath}`);

    const exists = fse.pathExistsSync(logspath);
    if (exists) {
        shell.openPath(logspath);
        return {
            code: 0,
            data: null,
            message: ""
        };
    } else {
        return {
            code: 1,
            data: null,
            message: "当前没有日志文件"
        };
    }
}

function WindowMessage(event, data) {
    if (global.MainWindow) {
        global.MainWindow.webContents.send(event, data)
    }
}

export { initialization, SaveWindowSize, GetWindowSize, GetBootStart, SaveBootStart, GetGPU, SaveWebServerPort, GetWebServerPort, WindowMessage };