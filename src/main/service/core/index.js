import { ipcMain } from 'electron'
import db from '@main/utils/sqliteHelper'


function initialization() {
    // 监听来自渲染进程的消息  
    ipcMain.handle('index_DB_GetContent', async (event, data) => {
        let row = null;

        let queryParam = `%${data.keyword}%`;

        if (data.keyword) {
            // 查询数据
            row = await db.pagedAll(`
            SELECT
            	* 
            FROM
            	WebPage 
            WHERE
            	Title LIKE ? 
            	OR ContentText LIKE ? 
            ORDER BY
            CASE 
            	WHEN Title LIKE ? THEN
            	1 ELSE 2 END
        `, [queryParam, queryParam, queryParam], data.index, undefined);
        } else {
            // 查询数据
            row = await db.pagedAll(`SELECT * FROM WebPage ORDER BY Id DESC`, undefined, data.index, undefined);
        }

        // 发送响应回渲染进程
        return row;
    });
}


export default initialization