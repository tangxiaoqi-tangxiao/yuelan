import { ipcMain, app, shell } from "electron";
import { CheckUpdates } from '@main/service/window/autoUpdate.js'


function initialization() {
    ipcMain.handle('index:AboutHow:GetVersion', (event) => GetVersion());
    ipcMain.handle('index:AboutHow:GetCheckUpdates', (event) => GetCheckUpdates());
}

function GetVersion() {
    return {
        code: 0,
        data: app.getVersion(),
        message: "获取成功"
    }
}

async function GetCheckUpdates() {
    let bool = await CheckUpdates();
    return {
        code: 0,
        data: bool,
        message: "获取成功"
    }
}

export { initialization };