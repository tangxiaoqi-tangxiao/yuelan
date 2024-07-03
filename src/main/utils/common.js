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

export { formatDateTime };