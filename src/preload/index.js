import { contextBridge, ipcRenderer } from "electron/renderer";
// import { electronAPI } from "@electron-toolkit/preload";
import { resources } from '../main/utils/globalVariable'

// Custom APIs for renderer
const Api = {
  Winbutton: {
    Max: () => {
      ipcRenderer.send("index_WindowButton", "max");
    },
    Min: () => {
      ipcRenderer.send("index_WindowButton", "min");
    },
    Close: () => {
      ipcRenderer.send("index_WindowButton", "close");
    },
    UpdateIcon: (callback) =>
      ipcRenderer.on("index_UpdateIcon", (_event, value) => callback(value)),
  },
  // Search: (value) => ipcRenderer.send("index_Search", value),
  // loadLocalFile: (filePath) => {
  //   try {
  //     const fileContent = fs.readFileSync(filePath, "utf-8");
  //     console.log(fileContent)
  //     return fileContent;
  //   } catch (error) {
  //     console.error("Failed to read file:", error);
  //     return null;
  //   }
  // },
  DB: {
    GetContent: (data) => ipcRenderer.invoke('index_DB_GetWebPageList', data),
    GetFavoritesList: (data) => ipcRenderer.invoke('index_DB_GetFavoritesList', data),
  },
  File: {
    ResourcesPath: resources
  },
  RightClickMenu: {
    OpenWebPage: (UUID) => ipcRenderer.send("index_RightClickMenu_OpenWebPage", UUID)
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld("Api", Api);
  } catch (error) {
    console.error(error);
  }
} else {
  // window.electron = electronAPI
  window.Api = Api;
}
