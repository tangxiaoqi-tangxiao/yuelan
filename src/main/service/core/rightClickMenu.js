import { ipcMain, shell, dialog } from 'electron';
import path from 'path';
import { WebPageDataPath } from '@main/utils/globalVariable.js';
import fse from 'fs-extra';
import {
    GetWebPage, DelWebPage as DelWebPageDB, RenameTitleWebPage as RenameTitleWebPageDB, GetWebPageListFavorites,
    DelWebPageFavorites as DelWebPageFavoritesDB
} from './webPage';
import { InsertFavorites as InsertFavoritesDB, DelFavorites as DelFavoritesDB, RenameTitleFavorites as RenameTitleFavoritesDB } from './favorites';
import { WindowMessage } from './System';
import { sanitizeFilename, getFileVersionedName, isStringEmpty } from '@main/utils/common.js';
import { originalResourcesPath } from '@main/utils/globalVariable.js';

const { mhtmlTohtml } = require(path.join(originalResourcesPath, 'Node', 'index'));

const WebPagePath = path.join(WebPageDataPath, "WebPage");
const ImgsPath = path.join(WebPageDataPath, "Imgs");

function initialization() {
    ipcMain.handle("index:RightClickMenu:OpenWebPage", (event, data) => openWebPage(data));
    ipcMain.handle("index:RightClickMenu:exportWebPage", async (event, data) => exportWebPage(data));
    ipcMain.handle("index:RightClickMenu:DelWebPage", async (event, data) => DelWebPage(data));
    ipcMain.handle("index:RightClickMenu:RenameTitleWebPage", async (event, data) => RenameTitleWebPage(data.id, data.title));
    ipcMain.handle("index:RightClickMenu:exportWebPageList", async (event, data) => exportWebPageList(data));
    ipcMain.handle('index:RightClickMenu:InsertFavorites', async (event, data) => InsertFavorites(data));
    ipcMain.handle('index:RightClickMenu:exportHtml', async (event, data) => exportHtml(data));
    ipcMain.handle('index:RightClickMenu:openWebPageUrl', async (event, data) => openWebPageUrl(data));
    ipcMain.handle('index:RightClickMenu:DelWebPageFavorites', async (event, data) => DelWebPageFavorites(data));
    ipcMain.handle('index:RightClickMenu:DelFavorites', async (event, data) => DelFavorites(data));
    ipcMain.handle('index:RightClickMenu:RenameTitleFavorites', async (event, data) => RenameTitleFavorites(data));
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

//使用浏览器打开Url
async function openWebPageUrl(id) {
    let model = await GetWebPage(id);
    if (!model || isStringEmpty(model.Url)) {
        return {
            code: 1,
            data: null,
            message: "网页原地址为空"
        };
    }

    // 检查URL长度是否超过2000个字符
    if (model.Url.length > 2000) {
        // 截断URL到2000个字符，并在末尾添加'...'表示截断
        return model.Url.slice(0, 2000);
    }

    shell.openExternal(model.Url);
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
        let Dialog = await dialog.showOpenDialog(global.MainWindow, {
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
async function exportWebPageList(id) {
    return new Promise(async (resolve, reject) => {
        // 显示文件夹选择器对话框
        let Dialog = await dialog.showOpenDialog(global.MainWindow, {
            properties: ['openDirectory'] // 只允许选择文件夹
        });

        if (!Dialog.canceled) {
            const DialogPath = Dialog.filePaths[0];
            try {
                let datas = await GetWebPageListFavorites(id);
                if (datas) {
                    for (let index = 0; index < datas.length; index++) {
                        let data = datas[index];
                        let fileName = sanitizeFilename(data.Title);
                        fileName = getFileVersionedName(path.join(DialogPath, `${fileName}.mhtml`));
                        await copyFile(path.join(WebPagePath, data.UUID + ".mhtml"), path.join(DialogPath, `${fileName}`));
                    }
                } else {
                    resolve({
                        code: 1,
                        data: null,
                        message: ""
                    });
                }
            } catch (err) {
                console.log(err)
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
        WindowMessage("WebContents:MonitorFavorites");
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

//导出html
async function exportHtml(id) {
    return new Promise(async (resolve, reject) => {
        // 显示文件夹选择器对话框
        let Dialog = await dialog.showOpenDialog(global.MainWindow, {
            properties: ['openDirectory'] // 只允许选择文件夹
        });

        if (!Dialog.canceled) {
            const DialogPath = Dialog.filePaths[0];
            try {
                let data = await GetWebPage(id);
                if (data) {
                    let fileName = sanitizeFilename(data.Title);
                    fileName = getFileVersionedName(path.join(DialogPath, `${fileName}.html`));

                    fse.readFile(path.join(WebPagePath, data.UUID + ".mhtml"), 'utf8').then(str => {
                        str = mhtmlTohtml(str);
                        fse.writeFile(path.join(DialogPath, `${fileName}`), str);
                        resolve({
                            code: 0,
                            data: null,
                            message: ""
                        });
                    }).catch(err => {
                        resolve({
                            code: 1,
                            data: null,
                            message: err
                        });
                    });
                } else {
                    resolve({
                        code: 1,
                        data: null,
                        message: "数据不存在"
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

//删除收藏夹的所有网页
async function DelWebPageFavorites(id) {
    let result = await DelWebPageFavoritesDB(id);
    if (result.changes > 0) {
        return {
            code: 0,
            data: null,
            message: ""
        };
    }
    return {
        code: 1,
        data: null,
        message: "删除失败"
    };
}

//删除收藏夹
async function DelFavorites(id) {
    let result = await DelFavoritesDB(id);
    if (result) {
        return {
            code: 0,
            data: null,
            message: ""
        };
    }
    return {
        code: 1,
        data: null,
        message: "删除失败"
    };
}

//重命名收藏夹
async function RenameTitleFavorites(data) {
    let result = await RenameTitleFavoritesDB(data);
    if (result.changes > 0) {
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

async function copyFiles(arr) {
    return new Promise(async (resolve, reject) => {
        for (const data of arr) {
            fse.copy(data.inputPath, data.outputPath, err => {
                if (err) reject(err);
                console.log('success!');
            });
        }
        resolve();
    });
}

async function copyFile(inputPath, outputPath) {
    return new Promise(async (resolve, reject) => {
        fse.copy(inputPath, outputPath, err => {
            if (err) reject(err);
            resolve();
        });
    });
}
export { initialization, openWebPage, exportWebPage, exportWebPageList };