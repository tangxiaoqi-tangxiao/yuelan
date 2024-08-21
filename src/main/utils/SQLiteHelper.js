import Database from 'better-sqlite3';
import { yuelan_db3_Path } from './globalVariable';

class SQLiteHelper {
    constructor(dbFilePath) {
        try {
            this.db = new Database(dbFilePath);
            console.log('Connected to the SQLite database.');
        } catch (err) {
            console.error('Error opening database:', err.message);
        }
    }

    run(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            const info = stmt.run(...params);
            return Promise.resolve({ id: info.lastInsertRowid, changes: info.changes });
        } catch (err) {
            console.error('Error running SQL:', err.message);
            return Promise.reject(err);
        }
    }

    get(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            const row = stmt.get(...params);
            return Promise.resolve(row);
        } catch (err) {
            console.error('Error fetching data:', err.message);
            return Promise.reject(err);
        }
    }

    all(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            const rows = stmt.all(...params);
            return Promise.resolve(rows);
        } catch (err) {
            console.error('Error fetching data:', err.message);
            return Promise.reject(err);
        }
    }

    // 分页查询函数
    pagedAll(sql, params = [], page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
        const pagedSql = `${sql} LIMIT ? OFFSET ?`;
        return this.all(pagedSql, [...params, pageSize, offset]);
    }

    close() {
        try {
            this.db.close();
            console.log('Closed the database connection.');
            return Promise.resolve();
        } catch (err) {
            console.error('Error closing database:', err.message);
            return Promise.reject(err);
        }
    }
}

const db = new SQLiteHelper(yuelan_db3_Path);

export default db;
