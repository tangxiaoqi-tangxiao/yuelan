import { ipcMain, app } from "electron";
import db from '@main/utils/sqliteHelper';

function initialization() {
    ipcMain.handle('index:System:BootStart', async (event, data) => BootStart(data));
    ipcMain.handle('index:System:GetBootStart', async (event) => GetBootStart());
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
        // args: [] String Windows - 要传递给可执行文件的命令行参数。默认为空数组。注意用引号将路径换行。
    });
    //更新是否自启动
    SaveBootStart(bool);
}

async function GetBootStart() {
    const key = "BootStart";
    let model = await db.get(`SELECT * FROM "Window" WHERE "Key"=?`, [key]);
    return model;
}

async function SaveBootStart(bool) {
    const key = "BootStart";
    let result = await GetBootStart();
    if (result) {
        db.run(`UPDATE "Window" SET "Value" = ? WHERE "KEY"=?`, [bool, key]);
    } else {
        db.run(`INSERT INTO "Window" VALUES(NULL,?,?)`, [key, bool]);
    }
}

export { initialization, SaveWindowSize, GetWindowSize ,GetBootStart,SaveBootStart};