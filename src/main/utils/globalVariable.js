import path from 'path';
import fse from 'fs-extra';
import { app, ipcMain } from 'electron';

// 定义全局文件路径
const resourcesStr = "resources"
const dbStr = "yuelan.db3";
const userDataPath = app.getPath('userData');
const originalResourcesPath = path.join(__dirname.replace("app.asar", "app.asar.unpacked"), '..', '..', resourcesStr);

const resourcesPath = path.join(userDataPath, resourcesStr);
const WebPageDataPath = path.join(resourcesPath, 'WebPageData');
const yuelan_db3_Path = path.join(resourcesPath, "Data", dbStr);

//定义全局静态变量
const UUID = "c419c0ed-55de-467d-9a5e-07bebf592e6c";

// 检查数据库文件是否存在，如果不存在则从指定位置复制
CheckTheData();

export { 
    originalResourcesPath, 
    resourcesPath, 
    WebPageDataPath, 
    yuelan_db3_Path, 
    UUID,
};

ipcMain.handle("index:globalVariable:WebPageDataPath", () => WebPageDataPath);
ipcMain.handle("index:globalVariable:resourcesPath", () => resourcesPath);

// 定义 CheckTheData 函数用于检查数据库文件是否存在，不存在则从指定位置复制
function CheckTheData() {
    // 检查数据库文件是否存在
    const fileExists = fse.pathExistsSync(yuelan_db3_Path);

    // 如果数据库文件不存在
    if (!fileExists) {
        // 构建原始数据库文件的路径
        let dbcopy = path.join(originalResourcesPath, "Data", dbStr);
        // 使用 fs-extra 模块同步复制文件
        fse.copySync(dbcopy, yuelan_db3_Path);
    }
}
