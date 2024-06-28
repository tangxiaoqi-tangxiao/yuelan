import express from 'express';
import fs from 'fs';
import path from 'path'
import SQLiteHelper from '@main/utils/SQLiteHelper'

const db = new SQLiteHelper(path.join(__dirname, "../../resources/data/yuelan.db3"));

const app = express();

// 解析 JSON 请求体
app.use(express.json({ limit: '2gb' }));

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

//自定义中间件来解析纯字符串数据
app.use((req, res, next) => {
    if (req.headers['content-type'] === 'text/plain') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            req.body = body;
            next();
        });
    } else {
        next();
    }
});

app.post("/SendMhtml", (req, res) => {
    // 读取请求体中的字符串数据
    const requestBody = req.body; // 这将是一个对象，包含请求体的所有数据

    // 插入数据
    db.run('INSERT INTO WebPage VALUES (NULL,?, ?, ?,?)', [requestBody.title, requestBody.data, requestBody.contentText, requestBody.base64Image])
        .then((result) => {
            console.log('Data inserted, ID:', result.id);
        })
        .catch((err) => {
            console.error(err);
        });
    // // 异步写入文件
    // fs.writeFile(`C:\\Users\\tangx\\Desktop\\杂项\\${requestBody.title}.mhtml`, requestBody.data, (err) => {
    //     if (err) throw err;
    //     res.status(200).send('Hello, World!');
    // });
    res.status(200).send('');
});

export default () => {
    const server = app.listen(8080, () => {
        console.log('Web 服务地址: http://localhost:8080/');
    });
}