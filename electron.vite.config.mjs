import { resolve } from "path";
import { defineConfig, bytecodePlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  //主进程文件
  main: {
    plugins: [bytecodePlugin()],
    resolve: {
      alias: {
        "@main": resolve("src/main"),
        "@resources": resolve("resources"),
      },
    },
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  //渲染进程文件
  preload: {
    plugins: [],
    resolve: {
      alias: {
        "@preload": resolve("src/preload"),
      },
    }
  },
  //前端文件
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
      },
    },
    plugins: [vue()]
  },
});
