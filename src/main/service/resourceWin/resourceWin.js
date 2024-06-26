import { BrowserWindow, ipcMain, app } from "electron";
import { join } from "path";
import fs from "fs";
import crypto from "crypto";

class RenderWindows {
  static win = null;
  static createResourceWin() {
    if (this.win == null) {
      // 创建浏览器窗口，并赋值给 global.win
      this.win = new BrowserWindow({
        fullscreen: true,
        show: false,
        webPreferences: {
          preload: join(__dirname, "../preload/resourceWin.js"),
          sandbox: false,
        },
      });
    }
  }

  Analysis(value) {
    const bytesToRead = 1024 * 1024; // 1MB
    const hash = crypto.createHash('sha256');
    fs.stat(value, (err, stats) => {
      if (err) {
        console.error('无法获取文件信息:', err);
        return;
      }

      //获取可以读取的文件结束位置
      const fileSize = stats.size;
      console.log(value, stats);
      const end = Math.min(fileSize, bytesToRead) - fileSize > 0 ? 1 : 0;
      console.log(end);
      // 创建读取流，指定开始和结束位置
      const fileStream = fs.createReadStream(value, { start: 0, end });

      fileStream.on('data', (chunk) => {
        hash.update(chunk);
      });

      fileStream.on('end', () => {
        const hashValue = hash.digest('hex');
        console.log(`文件前 ${Math.min(fileSize, bytesToRead)} 字节的哈希值是: ${hashValue}`);
      });

      fileStream.on('error', (err) => {
        console.error('读取文件时出错:', err);
      });
    });
    // const mhtmlContent = fs.readFileSync(value, 'utf-8');

    // console.log(mhtmlContent);
    // RenderWindows.win.loadFile("C:\\Users\\tangx\\Downloads\\vue基础 - 掘金.mhtml");
    // RenderWindows.win.webContents.on('did-finish-load', () => {
    //   RenderWindows.win.webContents.capturePage().then(img => {
    //     fs.writeFile("C:\\Users\\tangx\\Downloads\\vue基础 - 掘金.png", img.toPNG(), (err) => {
    //       // console.log("错误信息：", err);
    //     });
    //   });
    //   RenderWindows.win.webContents
    //     .executeJavaScript(
    //       `
    //         document.documentElement.outerHTML
    //         `
    //     ).then((html) => {
    //       console.log(html);
    //     }).catch(err => {
    //       console.error('错误信息:', err);
    //     });
    // });

    // mhtml2html.convert(mhtmlContent).then(result =>{
    //     console.log(result.html);
    // });
    // RenderWindows.win.loadURL("https://cn.electron-vite.org");
    // RenderWindows.win.webContents.on("did-finish-load", () => {
    //   try {
    //     console.log(value);
    //     RenderWindows.win.webContents
    //       .executeJavaScript(
    //         `
    //         function selectAllText() {
    //           // 创建一个新的选区
    //           var selection = window.getSelection();

    //           // 获取页面中所有的文本节点
    //           var textNodes = document.createTreeWalker(
    //             document.body,
    //             NodeFilter.SHOW_TEXT,
    //             null,
    //             false
    //           );

    //           // 存储被选中的文本
    //           var selectedTexts = [];

    //           // 遍历每个文本节点
    //           while (textNodes.nextNode()) {
    //             var currentNode = textNodes.currentNode;
    //             // 将文本节点的内容添加到选中文本的数组中
    //             var text = currentNode.nodeValue.trim(); // 去除文本前后的空白字符
    //             if (text !== '') {
    //               selectedTexts.push(text);
    //             }
    //             // 选中当前文本节点
    //             selection.selectAllChildren(currentNode.parentNode);
    //           }

    //           // 将所有被选中的文本拼接为一个字符串
    //           return selectedTexts.join('');
    //         }

    //         selectAllText()
    //         `
    //       ).then((data)=>{
    //         console.log(data);
    //       })
    //     // this.captureWindow(RenderWindows.win);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // });
  }

  //保存截图
  captureWindow(window) {
    window.webContents
      .capturePage()
      .then((image) => {
        // 保存截图
        const screenshotPath = join(
          app.getAppPath(),
          "resources",
          "imgs",
          "screenshot.png"
        );
        console.log(screenshotPath);
        fs.writeFile(screenshotPath, image.toPNG(), (err) => {
          if (err) {
            console.error("Failed to save screenshot:", err);
          } else {
            console.log("Screenshot saved to:", screenshotPath);
          }
        });
      })
      .catch((err) => {
        console.error("Failed to capture screenshot:", err);
      });
  }
}
export default RenderWindows;