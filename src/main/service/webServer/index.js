import { shell } from "electron";
import express from 'express';
import multer from 'multer';
import bodyParser, { json } from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { InsertWebPage, DelWebPage, GetWebPage } from '@main/service/core/webPage';
import { formatDateTime, checkPort } from '@main/utils/common';
import logger from '@main/utils/logger';
import { WebPageDataPath, UUID } from '@main/utils/globalVariable';
import { WindowMessage, GetWebServerPort, SaveWebServerPort } from '@main/service/core/System';

//全局变量
const app = express();
const WebPagePath = path.join(WebPageDataPath, "WebPage");
const ImgsPath = path.join(WebPageDataPath, "Imgs");

//全局可变变量
let server = null;

// 解析 JSON 请求体
app.use(bodyParser.json({ limit: '2gb' }));

//文件解析
const memoryStorage = multer.memoryStorage();
const upload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024,//设置上传表单中每个字段的最大大小限制
        fieldSize: 2 * 1024 * 1024 * 1024,//设置单个文件最大大小
    }
});

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

app.get("/", (req, res) => {
    if (req.query.uuid == UUID) {
        res.send("Web 服务启动成功");
    } else {
        res.status(404).send('');
    }
});

app.post("/SendMhtml", upload.single('file'), async (req, res) => {
    logger.info('请求触发');
    const uploadedFile = req.file;
    // 读取请求体中的字符串数据
    const jsonData = JSON.parse(req.body.data); // 这将是一个对象，包含请求体的所有数据

    let uuid = `${uuidv4()}_${formatDateTime(undefined, "YYYYMMDDHHmmss")}`;
    try {
        // 插入数据
        let result = await InsertWebPage({ uuid, title: jsonData.title, contentText: jsonData.contentText, Url: jsonData.Url });
        if (result.changes > 0) {
            let id = result.id;
            ensureDirExists(WebPagePath);
            // 异步写入文件
            fs.writeFile(path.join(WebPagePath, `${uuid}.mhtml`), uploadedFile.buffer, (err) => {
                if (err) {
                    //删除插入数据
                    DelWebPage(id)
                        .then((result) => {
                            logger.info(`删除数据，ID：${result.id}`);
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                    res.status(500).send('');
                } else {
                    ensureDirExists(ImgsPath);
                    // 将 Base64 编码的数据写入文件
                    fs.writeFile(path.join(ImgsPath, `${uuid}.png`), jsonData.base64Image, { encoding: 'base64' }, async function (err) {
                        if (err) {
                            logger.error(`文件保存失败,错误信息：${err}`);
                        } else {
                            logger.info('文件保存成功');
                        }
                        //更新默认窗口页面数据
                        let data = await GetWebPage(id);
                        WindowMessage('WebContents:MonitorNewWebPage', data);
                    });
                    res.status(200).send('');
                }
            });
        } else {
            res.status(500).send('');
            logger.error(`插入数据失败`);
        }

    } catch (err) {
        res.status(500).send('');
        logger.error(`错误信息：${err}`);
    }
});

// 确保目录存在的函数
function ensureDirExists(dirPath) {
    try {
        logger.info(dirPath);
        // 使用{ recursive: true }选项来确保所有父目录也被创建  
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`${dirPath} 目录已存在或已创建。`);
    } catch (err) {
        console.error(`创建目录时出错: ${err}`);
    }
}

// Express应用的启动函数
function startServer(port) {
    console.log("端口：", port);
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            let port_ = server.address().port;
            if (port == 0) {
                SaveWebServerPort(port_);
                shell.openExternal(`http://localhost:${port_}?uuid=${UUID}`);
            }
            console.log(`Web 服务地址: http://localhost:${port_}/`);
            resolve();
        }).on("error", (err) => {
            server = null;
            if (err.code === "EADDRINUSE") {
                logger.error("端口已被占用");
                reject("端口已被占用");
            } else {
                logger.error("启动服务器时出错:", err)
            }
            reject(err);
        });
    });
};

// 重新设置端口并重启服务器的函数
function reassignPort(newPort) {
    return new Promise((resolve, reject) => {
        if (!(newPort >= 0 && newPort <= 65535)) {
            reject("端口号不合法");
        }

        if (server) {
            server.close(() => {
                // 重新启动服务器
                startServer(newPort)
                    .then(resolve)
                    .catch(reject);
            });
        } else {
            // 重新启动服务器
            startServer(newPort)
                .then(resolve)
                .catch(reject);
        }
    });
};

export const WebServer = async () => {
    let model = await GetWebServerPort();
    let Port = 0;
    if (model) {
        try {
            let result = await checkPort(model.Value);
            if (!result) {
                Port = model.Value;
            }
        } catch (err) {
            logger.error("端口检查失败");
        }
    }
    startServer(Port);
};

// export { reassignPort };