import sqlite3 from 'sqlite3';
import {yuelan_db3_Path} from './globalVariable'

const sqlite = sqlite3.verbose();

class SQLiteHelper {
    constructor(dbFilePath) {
        this.db = new sqlite.Database(dbFilePath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.error('Error running SQL:', err.message);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('Error fetching data:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                console.log(sql,params)
                if (err) {
                    console.error('Error fetching data:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 分页查询函数
    pagedAll(sql, params = [], page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
        const pagedSql = `${sql} LIMIT ? OFFSET ?`;
        return this.all(pagedSql, [...params, pageSize, offset]);
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                    reject(err);
                } else {
                    console.log('Closed the database connection.');
                    resolve();
                }
            });
        });
    }
}

const db = new SQLiteHelper(yuelan_db3_Path);

export default db;