import { Sequelize, DataTypes, Model } from "sequelize"

class DatabaseHelper {
    constructor(databaseFile) {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: databaseFile,
            logging: false // 禁用日志输出
        });
    }

    // 定义模型
    defineModel(name, attributes) {
        const model = this.sequelize.define(name, attributes);
        this[name] = model;
        return model;
    }

    // 同步数据库
    async sync() {
        try {
            await this.sequelize.sync();
            console.log('Database synchronized');
        } catch (error) {
            console.error('Error synchronizing the database:', error);
        }
    }

    // 创建记录
    async create(modelName, data) {
        try {
            const model = this[modelName];
            if (!model) throw new Error(`Model ${modelName} is not defined`);
            const record = await model.create(data);
            console.log(`${modelName} created:`, record.toJSON());
            return record;
        } catch (error) {
            console.error(`Error creating ${modelName}:`, error);
            throw error;
        }
    }

    // 查找所有记录
    async findAll(modelName) {
        try {
            const model = this[modelName];
            if (!model) throw new Error(`Model ${modelName} is not defined`);
            const records = await model.findAll();
            console.log(`All ${modelName}s:`, records.map(record => record.toJSON()));
            return records;
        } catch (error) {
            console.error(`Error fetching all ${modelName}s:`, error);
            throw error;
        }
    }

    // 根据ID查找记录
    async findById(modelName, id) {
        try {
            const model = this[modelName];
            if (!model) throw new Error(`Model ${modelName} is not defined`);
            const record = await model.findByPk(id);
            if (record) {
                console.log(`${modelName} found:`, record.toJSON());
                return record;
            } else {
                console.log(`${modelName} not found`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching ${modelName} by ID:`, error);
            throw error;
        }
    }

    // 更新记录
    async update(modelName, id, updates) {
        try {
            const record = await this.findById(modelName, id);
            if (record) {
                await record.update(updates);
                console.log(`${modelName} updated:`, record.toJSON());
                return record;
            } else {
                console.log(`${modelName} not found for update`);
                return null;
            }
        } catch (error) {
            console.error(`Error updating ${modelName}:`, error);
            throw error;
        }
    }

    // 删除记录
    async delete(modelName, id) {
        try {
            const record = await this.findById(modelName, id);
            if (record) {
                await record.destroy();
                console.log(`${modelName} deleted`);
                return true;
            } else {
                console.log(`${modelName} not found for deletion`);
                return false;
            }
        } catch (error) {
            console.error(`Error deleting ${modelName}:`, error);
            throw error;
        }
    }

    // 关闭数据库连接
    async close() {
        try {
            await this.sequelize.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing the database connection:', error);
            throw error;
        }
    }
}

module.exports = DatabaseHelper;
