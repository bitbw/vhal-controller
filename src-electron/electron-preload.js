/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.js you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import { contextBridge, ipcRenderer } from 'electron'

// 暴露 VHAL API 到渲染进程
contextBridge.exposeInMainWorld('vhalAPI', {
  // 获取服务状态
  getStatus: () => ipcRenderer.invoke('get-status'),
  
  // 连接 ADB 设备
  connectAdb: () => ipcRenderer.invoke('connect-adb'),
  
  // 断开 ADB 连接
  disconnectAdb: () => ipcRenderer.invoke('disconnect-adb'),
  
  // 启用测试模式
  enableTestMode: () => ipcRenderer.invoke('enable-test-mode'),
  
  // 执行车辆信号命令
  executeVehicleCommand: (signal, value) => 
    ipcRenderer.invoke('execute-vehicle-command', { signal, value }),
  
  // 执行自定义 ADB 命令
  executeCustomCommand: (command) => 
    ipcRenderer.invoke('execute-custom-command', { command }),
  
  // 检查是否在 Electron 环境中
  isElectron: true
})
