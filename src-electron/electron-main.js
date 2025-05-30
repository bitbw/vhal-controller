import { app, BrowserWindow, ipcMain } from 'electron'
import { exec } from 'child_process'
import path from 'path'
import os from 'os'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

let mainWindow

// ADB 连接状态
let isAdbConnected = false
let isTestModeEnabled = false

// 执行 ADB 命令的通用函数
function executeCommand(command, timeout = 15000) {
  return new Promise((resolve, reject) => {
    console.log(`[Electron] 执行命令: ${command}`)
    
    const child = exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Electron] 命令执行错误: ${error.message}`)
        reject({
          success: false,
          error: error.message,
          stderr: stderr,
          command: command
        })
        return
      }
      
      if (stderr && stderr.trim() !== '') {
        console.warn(`[Electron] 命令警告: ${stderr}`)
      }
      
      console.log(`[Electron] 命令输出: ${stdout}`)
      resolve({
        success: true,
        stdout: stdout,
        stderr: stderr,
        command: command
      })
    })
    
    // 设置超时处理
    setTimeout(() => {
      child.kill('SIGTERM')
      reject({
        success: false,
        error: '命令执行超时',
        command: command
      })
    }, timeout)
  })
}

// 检查 ADB 是否可用
async function checkAdbAvailable() {
  try {
    const result = await executeCommand('adb version', 5000)
    return result.success
  } catch (error) {
    return false
  }
}

// 检查设备连接状态
async function checkDeviceConnection() {
  try {
    const result = await executeCommand('adb devices', 5000)
    if (result.success) {
      const devices = result.stdout.split('\n')
        .filter(line => line.includes('\tdevice'))
        .length
      return devices > 0
    }
    return false
  } catch (error) {
    return false
  }
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1200,
    height: 800,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

// IPC 处理器

// 获取服务状态
ipcMain.handle('get-status', async () => {
  try {
    const adbAvailable = await checkAdbAvailable()
    const deviceConnected = adbAvailable ? await checkDeviceConnection() : false
    
    return {
      success: true,
      data: {
        adbAvailable,
        deviceConnected,
        isAdbConnected,
        isTestModeEnabled,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})

// 连接 ADB 设备
ipcMain.handle('connect-adb', async () => {
  try {
    // 首先检查 ADB 是否可用
    const adbAvailable = await checkAdbAvailable()
    if (!adbAvailable) {
      return {
        success: false,
        error: 'ADB 不可用，请确保 Android SDK 已安装并添加到 PATH'
      }
    }
    
    // 获取 root 权限并进入 shell
    const rootResult = await executeCommand('adb root')
    console.log('[Electron] Root 结果:', rootResult)
    
    // 等待一下让设备重新连接
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 检查设备连接
    const deviceConnected = await checkDeviceConnection()
    if (!deviceConnected) {
      return {
        success: false,
        error: '未找到连接的设备，请确保设备已连接并启用 USB 调试'
      }
    }
    
    isAdbConnected = true
    
    return {
      success: true,
      message: '设备连接成功',
      data: {
        isAdbConnected: true,
        command: 'adb root && adb shell'
      }
    }
    
  } catch (error) {
    isAdbConnected = false
    return {
      success: false,
      error: error.message || error.error
    }
  }
})

// 断开 ADB 连接
ipcMain.handle('disconnect-adb', async () => {
  try {
    await executeCommand('adb disconnect')
    isAdbConnected = false
    isTestModeEnabled = false
    
    return {
      success: true,
      message: '设备已断开连接',
      data: {
        isAdbConnected: false,
        isTestModeEnabled: false
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || error.error
    }
  }
})

// 启用测试模式
ipcMain.handle('enable-test-mode', async () => {
  try {
    if (!isAdbConnected) {
      return {
        success: false,
        error: '请先连接设备'
      }
    }
    
    const command = 'adb shell "vehicle_tool -s DEBUG_COMMAND:enable_test_mode=1"'
    const result = await executeCommand(command)
    
    if (result.success) {
      isTestModeEnabled = true
    }
    
    return {
      success: result.success,
      message: result.success ? '测试模式已启用' : '测试模式启用失败',
      data: {
        isTestModeEnabled: result.success,
        command: command,
        output: result.stdout
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message || error.error
    }
  }
})

// 执行车辆信号命令
ipcMain.handle('execute-vehicle-command', async (event, { signal, value }) => {
  try {
    if (!signal || value === undefined) {
      return {
        success: false,
        error: '缺少必要参数: signal 和 value'
      }
    }
    
    if (!isAdbConnected) {
      return {
        success: false,
        error: '请先连接设备'
      }
    }
    
    if (!isTestModeEnabled) {
      return {
        success: false,
        error: '请先启用测试模式'
      }
    }
    
    const command = `adb shell "vehicle_tool -s ${signal}:${value}"`
    
    // 为车速命令使用较短的超时时间
    const timeout = signal === 'VehSpd' ? 1000 : 5000 // Electron 中可以更短
    const result = await executeCommand(command, timeout)
    
    return {
      success: result.success,
      message: result.success ? `${signal} 设置为 ${value} 成功` : `${signal} 设置失败`,
      data: {
        signal,
        value,
        command: command,
        output: result.stdout,
        timestamp: new Date().toISOString()
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message || error.error
    }
  }
})

// 执行自定义 ADB 命令
ipcMain.handle('execute-custom-command', async (event, { command }) => {
  try {
    if (!command) {
      return {
        success: false,
        error: '缺少命令参数'
      }
    }
    
    // 安全检查：只允许 adb 相关命令
    if (!command.startsWith('adb')) {
      return {
        success: false,
        error: '只允许执行 ADB 命令'
      }
    }
    
    const result = await executeCommand(command)
    
    return {
      success: result.success,
      message: result.success ? '命令执行成功' : '命令执行失败',
      data: {
        command: command,
        output: result.stdout,
        error: result.stderr,
        timestamp: new Date().toISOString()
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message || error.error
    }
  }
})
