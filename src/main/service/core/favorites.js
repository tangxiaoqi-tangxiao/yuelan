import { ipcMain } from 'electron';
import db from '@main/utils/sqliteHelper';


function initialization() {
    ipcMain.handle('index:DB:GetFavoritesList', async (event, data) => GetFavoritesList(data));
}

async function GetFavoritesList(data) {
    let row = null;

    let queryParam = `%${data.keyword}%`;

    if (data.keyword) {
        // 查询数据
        row = await db.pagedAll(`SELECT * FROM "Favorites" WHERE name like ?`, [queryParam], data.index, 100);
    } else {
        // 查询数据
        row = await db.pagedAll(`SELECT * FROM "Favorites"`, undefined, data.index, 100);
    }

    // 发送响应回渲染进程
    return row;
}

//创建收藏夹
async function InsertFavorites(data) {
    let result = await db.run(`INSERT INTO Favorites VALUES(NULL,?,datetime('now', 'localtime'))`, [data]);
    return result;
}

//删除收藏夹
async function DelFavorites(data) {
    let result = await db.run(`DELETE FROM Favorites WHERE Id=?`, [data]);
    if (result.changes > 0) {
        //将WebPage收藏夹id置为null
        let result = await db.run(`UPDATE WebPage SET Favorites_Id = NULL WHERE Id=?`, [data]);
        if (result.changes >= 0) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;

    }
}

//重命名
async function RenameTitleFavorites(data) {
    let result = await db.run(`UPDATE Favorites SET Name=? WHERE Id=?`, [data.Name, data.Id]);
    return result;
}

export { initialization, GetFavoritesList, InsertFavorites, DelFavorites,RenameTitleFavorites }