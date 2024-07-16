import db from '@main/utils/sqliteHelper';

async function SaveWindowSize(params) {
    let result = await GetWindowSize();
    if (result) {
        db.run(`UPDATE "Window" SET "Value" = ? WHERE "KEY"=?`, [params, "WindowSize"]);
    } else {
        db.run(`INSERT INTO "Window" VALUES(NULL,?,?)`, ["WindowSize", params]);
    }
}


async function GetWindowSize() {
    let model = await db.get(`SELECT * FROM "Window" WHERE "Key"='WindowSize'`, []);
    return model;
}

export { SaveWindowSize, GetWindowSize };