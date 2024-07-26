import { ipcMain, shell, dialog } from 'electron';
import path from 'path';
import { resources } from '@main/utils/globalVariable.js';
import fse from 'fs-extra';
import { GetWebPage, DelWebPage as DelWebPageDB, RenameTitleWebPage as RenameTitleWebPageDB } from './webPage';
import { InsertFavorites as InsertFavoritesDB } from './favorites';
import { WindowMessage } from './window';
import { sanitizeFilename, getFileVersionedName } from '@main/utils/common.js';

const WebPagePath = path.join(resources, "WebPage");
const ImgsPath = path.join(resources, "Imgs");

function initialization() {
    ipcMain.handle("index:RightClickMenu:OpenWebPage", (event, UUID) => openWebPage(UUID));
    ipcMain.handle("index:RightClickMenu:exportWebPage", async (event, id) => exportWebPage(id));
    ipcMain.handle("index:RightClickMenu:DelWebPage", async (event, id) => DelWebPage(id));
    ipcMain.handle("index:RightClickMenu:RenameTitleWebPage", async (event, data) => RenameTitleWebPage(data.id, data.title));
    ipcMain.handle("index:RightClickMenu:exportWebPageList", async (event, data) => exportWebPageList(data));
    ipcMain.handle('index:RightClickMenu:InsertFavorites', async (event, data) => InsertFavorites(data));
}

//使用浏览器打开web文件
function openWebPage(UUID) {
    if (!fse.pathExistsSync(path.join(WebPagePath, UUID + ".mhtml"))) {
        return {
            code: 1,
            data: null,
            message: "网页文件不存在"
        };
    }
    
    shell.openPath(path.join(WebPagePath, UUID + ".mhtml"));
    return {
        code: 0,
        data: null,
        message: ""
    };
}

//导出web文件
function exportWebPage(id) {
    return new Promise(async (resolve, reject) => {
        // 显示文件夹选择器对话框
        let Dialog = await dialog.showOpenDialog({
            properties: ['openDirectory'] // 只允许选择文件夹
        });

        if (!Dialog.canceled) {
            const DialogPath = Dialog.filePaths[0];
            try {
                let data = await GetWebPage(id);
                if (data) {
                    let fileName = sanitizeFilename(data.Title);
                    fileName = getFileVersionedName(path.join(DialogPath, `${fileName}.mhtml`));
                    fse.copy(path.join(WebPagePath, data.UUID + ".mhtml"), path.join(DialogPath, `${fileName}`), err => {
                        if (err) {
                            resolve({
                                code: 1,
                                data: null,
                                message: err
                            });
                        }
                        resolve({
                            code: 0,
                            data: null,
                            message: ""
                        });
                    }); // copies file
                } else {
                    resolve({
                        code: 1,
                        data: null,
                        message: ""
                    });
                }
            } catch (err) {
                resolve({
                    code: 1,
                    data: null,
                    message: err
                });
            }
        } else {
            resolve({
                code: -1,
                data: null,
                message: ""
            });
        }
    });
}

//导出web文件列表
function exportWebPageList(UUID) {
    // 显示文件夹选择器对话框
    let DialogArr = dialog.showOpenDialogSync({
        properties: ['openDirectory'] // 只允许选择文件夹
    });
    if (DialogArr) {
        const DialogPath = DialogArr[0];
        fse.copy(path.join(WebPagePath, UUID + ".mhtml"), path.join(DialogPath), err => {
            if (err) return console.error(err)
            console.log('success!');
        }); // copies file
    }
}

//删除web页面
async function DelWebPage(id) {
    let result = await DelWebPageDB(id);
    if (result.changes > 0) {
        fse.unlink(path.join(WebPagePath, result.UUID + ".mhtml"), (err) => {
            if (err) return console.error(err);
            console.log("删除成功", result.UUID);
        });
        fse.unlink(path.join(ImgsPath, result.UUID + ".png"), (err) => {
            if (err) return console.error(err);
            console.log("删除成功", result.UUID);
        });
        return {
            code: 0,
            data: id,
            message: ""
        };
    }
    return {
        code: 1,
        data: null,
        message: ""
    };
}

//重命名网页文件标题
async function RenameTitleWebPage(id, title) {
    let result = await RenameTitleWebPageDB(id, title);
    if (result.changes > 0) {
        return {
            code: 0,
            data: id,
            message: ""
        };
    }
    return {
        code: 1,
        data: id,
        message: "重命名失败"
    };
}

//新建收藏夹
async function InsertFavorites(data) {
    let result = await InsertFavoritesDB(data);
    if (result.changes > 0) {
        WindowMessage("MonitorFavorites");
        return {
            code: 0,
            data: null,
            message: ""
        };
    }
    return {
        code: 1,
        data: null,
        message: "更新收藏夹失败"
    };
}
export { initialization, openWebPage, exportWebPage, exportWebPageList };