import { ipcMain } from 'electron'
import db from '@main/utils/sqliteHelper'


function initialization() {
    ipcMain.handle('index:DB:GetWebPageList', async (event, data) => GetWebPageList(data));
}

async function GetWebPageList(data) {
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
}

async function GetWebPage(id) {
    const sql = `SELECT Id,Title,UUID FROM WebPage WHERE Id=?`;
    let data = await db.get(sql, [id]);
    return data;
}

async function DelWebPage(id) {
    let model = await GetWebPage(id);
    let result = null;
    if (model) {
        result = await db.run("DELETE FROM WebPage WHERE Id=?", [id]);
        result.UUID = model.UUID;
    } else {
        result = {
            changes: 0
        };
    }
    return result;
}

async function RenameTitleWebPage(id, title) {
    let result = await db.run("UPDATE WebPage SET Title=? WHERE Id=?", [title, id]);
    return result;
}

export { initialization, GetWebPageList, GetWebPage, DelWebPage, RenameTitleWebPage }