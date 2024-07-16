import { ipcMain } from 'electron'
import db from '@main/utils/sqliteHelper'


function initialization() {
    ipcMain.handle('index:DB:GetWebPageList', async (event, data) => GetWebPageList(data));
    ipcMain.handle('index:DB:Classification', async (event, data) => {
        let result = await Classification(data.WebPage_Id, data.Favorites_Id);
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
    });
}

async function InsertWebPage(params) {
    let result = await db.run(`INSERT INTO WebPage VALUES (NULL,NULL,?, ?, ?,datetime('now', 'localtime'))`, [params.uuid, params.title, params.contentText]);
    return result;
}

//获取webPage页面数据集合
async function GetWebPageList(data) {
    let row = null;

    let keyword_queryParam = `%${data.keyword}%`;

    if (data.keyword && data.FavoritesId && data.FavoritesId > 0) {
        let sql = ` SELECT * FROM WebPage WHERE Favorites_Id =? AND Title LIKE ? OR ContentText LIKE ? ORDER BY CASE WHEN Title LIKE ? THEN 1 ELSE 2 END`;
        // 查询数据
        row = await db.pagedAll(sql, [data.FavoritesId, keyword_queryParam, keyword_queryParam, keyword_queryParam], data.index, undefined);
    } else if (data.keyword) {
        let sql = `SELECT * FROM WebPage WHERE Title LIKE ? OR ContentText LIKE ? ORDER BY CASE WHEN Title LIKE ? THEN 1 ELSE 2 END`;
        // 查询数据
        row = await db.pagedAll(sql, [keyword_queryParam, keyword_queryParam, keyword_queryParam], data.index, undefined);
    } else if (data.FavoritesId && data.FavoritesId > 0) {
        let sql = `SELECT * FROM WebPage WHERE Favorites_Id =? ORDER BY Id DESC`;
        // 查询数据
        row = await db.pagedAll(sql, [data.FavoritesId], data.index, undefined);
    } else {
        // 查询数据
        row = await db.pagedAll(`SELECT * FROM WebPage ORDER BY Id DESC`, undefined, data.index, undefined);
    }
    //收藏夹
    {
        let arrId = row.map(e => e.Favorites_Id).filter(e => e && e > 0);
        arrId = arrId.filter((item, index) => arrId.indexOf(item) === index);
        const placeholders = arrId.map(() => '?').join(', ');
        let FavoritesList = arrId.length == 0 ? [] : await db.all(`SELECT * FROM Favorites WHERE Id IN (${placeholders})`, arrId);
        row.forEach(e => {
            if (FavoritesList.length == 0) {
                return;
            }
            let model = FavoritesList.find(x => x.Id == e.Favorites_Id);
            if (model) {
                e.FavoritesName = model.Name;
            }
        });
    }
    // 发送响应回渲染进程
    return row;
}

//获取webPage页面数据
async function GetWebPage(id) {
    const sql = `SELECT Id,Title,UUID FROM WebPage WHERE Id=?`;
    let data = await db.get(sql, [id]);
    return data;
}

//删除webPage页面数据
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

//更新标题
async function RenameTitleWebPage(id, title) {
    let result = await db.run("UPDATE WebPage SET Title=? WHERE Id=?", [title, id]);
    return result;
}

//设置文件夹
async function Classification(WebPage_Id, Favorites_Id) {
    let sql = `UPDATE WebPage SET Favorites_Id=? WHERE Id=?`;
    let result = await db.run(sql, [Favorites_Id, WebPage_Id]);
    return result;
}

export { initialization, GetWebPageList, GetWebPage, DelWebPage, RenameTitleWebPage, InsertWebPage }