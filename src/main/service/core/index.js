import { ipcMain } from 'electron'
import db from '@main/utils/sqliteHelper'


function initialization() {
    // 监听来自渲染进程的消息  
    ipcMain.handle('index_DB_GetContent', async (event, someData) => {
        // 插入数据
        let row = await db.pagedAll(`SELECT * FROM WebPage ORDER BY Id DESC`, undefined, someData, undefined);

        // 发送响应回渲染进程  
        return row;
    });
}


export default initialization