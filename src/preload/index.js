import { contextBridge, ipcRenderer } from "electron/renderer";
// import { electronAPI } from "@electron-toolkit/preload";

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
  WebContents: {
    MonitorFavorites: (callback) => ipcRenderer.on('WebContents:MonitorFavorites', (_event, value) => callback(value)),
    MonitorNewWebPage: (callback) => ipcRenderer.on('WebContents:MonitorNewWebPage', (_event, value) => callback(value)),
  },
  System: {
    BootStart: (data) => ipcRenderer.invoke('index:System:BootStart', data),
    GetBootStart: () => ipcRenderer.invoke('index:System:GetBootStart'),
    GetGPU: () => ipcRenderer.invoke('index:System:GetGPU'),
    SaveGPU: (data) => ipcRenderer.invoke('index:System:SaveGPU', data),
    OpenWebServerPort: (data) => ipcRenderer.invoke('index:System:OpenWebServerPort', data),
    OpenLogs: () => ipcRenderer.invoke('index:System:OpenLogs'),
  },
  AboutHow:{
    GetVersion: () => ipcRenderer.invoke('index:AboutHow:GetVersion'),
    GetCheckUpdates: () => ipcRenderer.invoke('index:AboutHow:GetCheckUpdates'),
  },
  DB: {
    GetWebPageList: (data) => ipcRenderer.invoke('index:DB:GetWebPageList', data),
    GetFavoritesList: (data) => ipcRenderer.invoke('index:DB:GetFavoritesList', data),
    Classification: (data) => ipcRenderer.invoke('index:DB:Classification', data),
  },
  FilePath: {
    WebPageDataPath: ipcRenderer.invoke('index:globalVariable:WebPageDataPath'),
    resourcesPath: ipcRenderer.invoke('index:globalVariable:resourcesPath'),
  },
  RightClickMenu: {
    OpenWebPage: (UUID) => ipcRenderer.invoke("index:RightClickMenu:OpenWebPage", UUID),
    exportWebPage: (id) => ipcRenderer.invoke("index:RightClickMenu:exportWebPage", id),
    DelWebPage: (id) => ipcRenderer.invoke("index:RightClickMenu:DelWebPage", id),
    RenameTitleWebPage: (data) => ipcRenderer.invoke("index:RightClickMenu:RenameTitleWebPage", data),
    exportWebPageList: (id) => ipcRenderer.invoke("index:RightClickMenu:exportWebPageList", id),
    InsertFavorites: (data) => ipcRenderer.invoke("index:RightClickMenu:InsertFavorites", data),
    exportHtml: (data) => ipcRenderer.invoke("index:RightClickMenu:exportHtml", data),
    openWebPageUrl: (data) => ipcRenderer.invoke("index:RightClickMenu:openWebPageUrl", data),
    DelWebPageFavorites: (data) => ipcRenderer.invoke("index:RightClickMenu:DelWebPageFavorites", data),
    DelFavorites: (data) => ipcRenderer.invoke("index:RightClickMenu:DelFavorites", data),
    RenameTitleFavorites: (data) => ipcRenderer.invoke("index:RightClickMenu:RenameTitleFavorites", data),
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
