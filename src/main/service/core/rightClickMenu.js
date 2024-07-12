import { ipcMain, shell, dialog } from 'electron';
import path from 'path';
import { resources } from '@main/utils/globalVariable.js';
import fse from 'fs-extra';
import { GetWebPage } from './webPage';
import { sanitizeFilename, getFileVersionedName } from '@main/utils/common.js';

const WebPagePath = path.join(resources, "WebPage");

//使用浏览器打开web文件
function openWebPage() {
    ipcMain.on("index_RightClickMenu_OpenWebPage", (event, UUID) => {
        shell.openPath(path.join(WebPagePath, UUID + ".mhtml"));
    });
}

//导出web文件
function exportWebPage() {
    ipcMain.on("index_RightClickMenu_exportWebPage", (event, id) => {
        // 显示文件夹选择器对话框
        let DialogArr = dialog.showOpenDialogSync({
            properties: ['openDirectory'] // 只允许选择文件夹
        });
        if (DialogArr) {
            const DialogPath = DialogArr[0];
            GetWebPage(id).then(data => {
                if (data) {
                    let fileName = sanitizeFilename(data.Title);
                    fileName = getFileVersionedName(path.join(DialogPath, `${fileName}.mhtml`));
                    fse.copy(path.join(WebPagePath, data.UUID + ".mhtml"), path.join(DialogPath, `${fileName}`), err => {
                        if (err) return console.error(err)
                        console.log('success!')
                    }); // copies file
                }
            });
        }
    });
}

//导出web文件列表
function exportWebPageList() {
    ipcMain.on("index_RightClickMenu_exportWebPageList", (event, UUID) => {
        // 显示文件夹选择器对话框
        let DialogArr = dialog.showOpenDialogSync({
            properties: ['openDirectory'] // 只允许选择文件夹
        });
        if (DialogArr) {
            const DialogPath = DialogArr[0];
            fse.copy(path.join(WebPagePath), path.join(DialogPath), err => {
                if (err) return console.error(err)
                console.log('success!')
            }); // copies file
        }
    });
}
export { openWebPage, exportWebPage, exportWebPageList };