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
    let result = await db.run(`INSERT INTO WebPage VALUES (NULL,NULL,?, ?, ?,datetime('now', 'localtime'),NULL)`, [params.uuid, params.title, params.contentText]);
    return result;
}

//获取webPage页面数据集合
async function GetWebPageList(data) {
    let row = null;

    data.FavoritesId = parseInt(data.FavoritesId);
    let keyword_queryParam = `%${data.keyword}%`;

    if (data.keyword && data.FavoritesId && data.FavoritesId > 0) {
        let sql = ` SELECT * FROM WebPage WHERE Favorites_Id =? AND (Title LIKE ? OR ContentText LIKE ?) ORDER BY CASE WHEN Title LIKE ? THEN 1 ELSE 2 END`;
        // 查询数据
        row = await db.pagedAll(sql, [data.FavoritesId, keyword_queryParam, keyword_queryParam, keyword_queryParam], data.index, undefined);
    } else if (data.keyword) {
        let sql = `SELECT * FROM WebPage WHERE Title LIKE ? OR ContentText LIKE ? ORDER BY CASE WHEN Title LIKE ? THEN 1 ELSE 2 END`;
        // 查询数据
        row = await db.pagedAll(sql, [keyword_queryParam, keyword_queryParam, keyword_queryParam], data.index, undefined);
    } else if (data.FavoritesId && data.FavoritesId > 0) {
        let sql = `SELECT * FROM WebPage WHERE Favorites_Id =? ORDER BY UpdateDate DESC`;
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

/**
 * 获取 Favorites_Id 为指定 id 的网页列表
 * @param {number} id - 要检索的 Favorites_Id
 * @throws {Error} 如果数据库检索失败，抛出错误
 * @return {Promise<object[]>} 检索操作的结果，包含检索到的记录列表
 */
async function GetWebPageListFavorites(id) {
    let sql = "";
    if(id)
    {
        sql = `SELECT Id,Favorites_Id,UUID,Title FROM WebPage WHERE Favorites_Id=?`;
    }else{
        sql = `SELECT Id,Favorites_Id,UUID,Title FROM WebPage`;
    }
    let datas = await db.all(sql,id?[id]:[]);
    return datas;
}


/**
 * 异步获取数据库中的网页记录
 * @param {number} id - 要检索的网页ID
 * @throws {Error} 如果数据库检索失败，抛出错误
 * @return {Promise<object | null>} 检索操作的结果，包含检索到的记录或 null
 */
async function GetWebPage(id) {
    const sql = `SELECT * FROM WebPage WHERE Id=?`;
    let data = await db.get(sql, [id]);
    return data;
}


/**
 * 删除数据库中的网页记录
 * @param {number} id - 要删除的网页的 ID
 * @throws {Error} 如果数据库删除失败，抛出错误
 * @return {Promise<object>} 删除操作的结果，包含删除的记录的 UUID 和变更数量。如果没有找到要删除的记录，则返回一个包含变更数量为 0 的对象。
 */
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


/**
 * 更新数据库中网页的标题
 * @param {number} id - 要更新的网页的 ID
 * @param {string} title - 新的网页标题
 * @throws {Error} 如果数据库更新失败，抛出错误
 * @return {Promise<object>} 更新操作的结果
 */
async function RenameTitleWebPage(id, title) {
    let result = await db.run("UPDATE WebPage SET Title=? WHERE Id=?", [title, id]);
    return result;
}


/**
 * 用于更新数据库中网页的收藏夹 ID 和更新日期
 * @param {number} WebPage_Id - 要更新的网页 ID
 * @param {number} Favorites_Id - 要设置的收藏夹 ID
 * @returns {Object} - 包含更新操作结果的对象
 */
async function Classification(WebPage_Id, Favorites_Id) {
    let sql = `UPDATE WebPage SET Favorites_Id=?,UpdateDate=datetime('now', 'localtime') WHERE Id=?`;
    let result = await db.run(sql, [Favorites_Id, WebPage_Id]);
    return result;
}


//删除指定收藏夹的网页数据
// async function Classification(WebPage_Id, Favorites_Id) {
//     let sql = `UPDATE WebPage SET Favorites_Id=?,UpdateDate=datetime('now', 'localtime') WHERE Id=?`;
//     let result = await db.run(sql, [Favorites_Id, WebPage_Id]);
//     return result;
// }
export { initialization, GetWebPageList, GetWebPage, DelWebPage, RenameTitleWebPage, InsertWebPage, GetWebPageListFavorites }