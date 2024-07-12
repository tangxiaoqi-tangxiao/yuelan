import { ipcMain } from 'electron'
import db from '@main/utils/sqliteHelper'

function GetWebPageList() {
    // 监听来自渲染进程的消息  
    ipcMain.handle('index_DB_GetWebPageList', async (event, data) => {
        let row = null;

        let keyword_queryParam = `%${data.keyword}%`;

        if (data.keyword && data.tagsId && data.tagsId > 0) {
            let sql = `SELECT WebPage.* FROM WebPage_Favorites JOIN WebPage ON WebPage_Favorites.WebPage_Id=WebPage.Id WHERE WebPage_Favorites.Favorites_Id=? AND Title LIKE ? OR ContentText LIKE ? ORDER BY CASE WHEN Title LIKE ? THEN 1 ELSE 2 END`;
            // 查询数据
            row = await db.pagedAll(sql, [data.tagsId, keyword_queryParam, keyword_queryParam, keyword_queryParam], data.index, undefined);
        } else if (data.keyword) {
            let sql = `SELECT * FROM WebPage WHERE Title LIKE ? OR ContentText LIKE ? ORDER BY CASE WHEN Title LIKE ? THEN 1 ELSE 2 END`;
            // 查询数据
            row = await db.pagedAll(sql, [keyword_queryParam, keyword_queryParam, keyword_queryParam], data.index, undefined);
        } else if (data.tagsId && data.tagsId > 0) {
            let sql = `SELECT WebPage.* FROM WebPage_Favorites JOIN WebPage ON WebPage_Favorites.WebPage_Id=WebPage.Id WHERE WebPage_Favorites.Favorites_Id=?`;
            // 查询数据
            row = await db.pagedAll(sql, [data.tagsId], data.index, undefined);
        } else {
            // 查询数据
            row = await db.pagedAll(`SELECT * FROM WebPage ORDER BY Id DESC`, undefined, data.index, undefined);
        }

        // 发送响应回渲染进程
        return row;
    });
}

async function GetWebPage(id) {
    const sql = `SELECT Title,UUID FROM WebPage WHERE Id=?`;
    let data = await db.get(sql, [id]);
    return data;
}

export { GetWebPageList, GetWebPage }