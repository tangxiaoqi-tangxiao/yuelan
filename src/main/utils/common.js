import fse from 'fs-extra';
import path from 'path';
import net from 'net';

//格式化日期
function formatDateTime(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss.sss') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0'); // 毫秒  

    // 替换格式字符串中的占位符
    let formattedDateTime = format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
        .replace('sss', milliseconds); // 毫秒  

    return formattedDateTime;
}

//去除不能作为文件名称的字符
function sanitizeFilename(filename) {
    // 定义非法字符的正则表达式模式
    const illegalCharsPattern = /[\/\?<>\\:\*\|":,\n\r]/g;

    // 用空字符串替换非法字符
    let sanitizedFilename = filename.replace(illegalCharsPattern, '').trim();

    // 如果长度超过100个字符，则截断
    if (sanitizedFilename.length > 100) {
        sanitizedFilename = sanitizedFilename.substring(0, 100);
    }

    //将点替换为下划线
    sanitizedFilename = sanitizedFilename.replace(/\./g, "_");

    return sanitizedFilename;
}

//判断文件是否存在，不存在返回原文件名称，存在增加版本号返回文件名称
function getFileVersionedName(filePath) {
    const fileName = path.basename(filePath);

    if (!fse.pathExistsSync(filePath)) {
        return fileName;
    }

    const getNewVersion = (fileName) => {
        const parts = fileName.split('_');
        const versionPart = parts[parts.length - 1];

        if (versionPart && !isNaN(versionPart)) {
            const versionNumber = parseInt(versionPart, 10);
            parts[parts.length - 1] = (versionNumber + 1).toString();
            return parts.join('_');
        } else {
            return `${fileName}_1`;
        }
    };

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);

    let newBase = getNewVersion(base);
    let newFilePath = path.join(dir, newBase + ext);

    while (fse.pathExistsSync(newFilePath)) {
        newBase = getNewVersion(newBase);
        newFilePath = path.join(dir, newBase + ext);
    }

    return newBase + ext;
}

function checkPort(port, host = '127.0.0.1') {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // 端口被占用
                resolve(true);
            } else {
                reject(err);
            }
        });

        server.once('listening', () => {
            // 端口未被占用
            server.close();
            resolve(false);
        });

        server.listen(port, host);
    });
}

function isStringEmpty(str) {
    // 检查是否为null或undefined
    if (str === null || str === undefined) {
        return true;
    }
    // 检查是否为只包含空格的字符串
    return str.trim() === '';
}

export { formatDateTime, sanitizeFilename, getFileVersionedName, checkPort, isStringEmpty };