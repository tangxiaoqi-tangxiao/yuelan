import { ipcMain } from 'electron'
import db from '@main/utils/sqliteHelper'


function initialization() {
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
            message: "重命名失败"
        };
    });

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

async function Classification(WebPage_Id, Favorites_Id) {
    let sql = `DELETE FROM WebPage_Favorites WHERE WebPage_Id=?`;
    let result = await db.run(sql, [WebPage_Id]);
    if (result.changes >= 0) {
        let sql2 = `INSERT INTO WebPage_Favorites VALUES(NULL,?,?)`;
        let result2 = await db.run(sql2, [WebPage_Id, Favorites_Id]);
        return result2;
    }
    return result;
}

export { initialization, GetFavoritesList }