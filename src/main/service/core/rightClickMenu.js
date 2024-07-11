import { ipcMain, shell } from 'electron';
import path from 'path';
import { resources } from '@main/utils/globalVariable.js'

function openWebPage() {
    ipcMain.on("index_RightClickMenu_OpenWebPage", (event, UUID) => {
        shell.openPath(path.join(resources, "WebPage", UUID + ".mhtml"));
    });
}

export { openWebPage };