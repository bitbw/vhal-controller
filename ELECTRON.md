# VHAL Controller - Electron 版本使用指南

## 🚀 Electron 版本优势

- ⚡ **超快响应**: 使用 IPC 通信，延迟 <1ms
- 🔒 **更安全**: 直接进程间通信，无网络风险
- 💪 **更稳定**: 不依赖网络连接和端口
- 🎯 **原生体验**: 桌面应用的完整功能

## 📦 启动方式

### 方法一：使用启动脚本（推荐）
```bash
# Windows
start-electron.bat

# 或者双击 start-electron.bat 文件
```

### 方法二：命令行启动
```bash
# 开发模式启动
npm run electron:dev

# 或者使用 Quasar CLI
quasar dev -m electron
```

## 🔧 构建 Electron 应用

### 开发版本
```bash
npm run electron:dev
```

### 生产版本构建
```bash
# 构建当前平台
npm run electron:build

# 构建 Windows 版本
npm run electron:build-win

# 构建 macOS 版本  
npm run electron:build-mac

# 构建 Linux 版本
npm run electron:build-linux
```

## 🆚 性能对比

| 特性 | HTTP 版本 | Electron 版本 |
|------|-----------|---------------|
| 通信方式 | HTTP 请求 | IPC 通信 |
| 延迟 | 10-50ms | <1ms |
| 网络依赖 | 需要 | 无需 |
| 端口占用 | 需要 3001 | 无需 |
| 安全性 | 网络传输 | 进程内通信 |
| 调试难度 | 容易 | 中等 |

## 🔍 技术架构

### Electron 主进程 (`src-electron/electron-main.js`)
- 处理 ADB 命令执行
- 管理设备连接状态
- 提供 IPC 接口

### 预加载脚本 (`src-electron/electron-preload.js`)
- 安全地暴露 API 到渲染进程
- 提供类型安全的接口

### 智能 API 服务 (`src/services/smart-api.js`)
- 自动检测运行环境
- 选择最优通信方式
- 统一的 API 接口

## 🛠 开发调试

### 查看日志
- **主进程日志**: 终端控制台输出
- **渲染进程日志**: 开发者工具 Console
- **IPC 通信**: 带有 `[ElectronAPI]` 前缀的日志

### 开启开发者工具
在 `src-electron/electron-main.js` 中设置：
```javascript
if (process.env.DEBUGGING) {
  mainWindow.webContents.openDevTools()
}
```

然后启动时设置环境变量：
```bash
set DEBUGGING=true && npm run electron:dev
```

## 📋 系统要求

- **操作系统**: Windows 7+, macOS 10.10+, Linux
- **Node.js**: >= 12.22.1
- **内存**: >= 4GB RAM
- **存储**: >= 500MB 可用空间
- **Android SDK**: 包含 ADB 工具

## 🐛 故障排除

### Electron 启动失败
```bash
# 清理缓存
npm run clean
npm install

# 重新构建
npm run electron:dev
```

### IPC 通信错误
1. 检查 `electron-preload.js` 是否正确加载
2. 确认 `contextBridge` API 已暴露
3. 查看主进程和渲染进程的错误日志

### ADB 命令执行失败
1. 确保 ADB 在系统 PATH 中
2. 检查设备连接状态
3. 验证设备权限设置

## 🚀 性能优化建议

1. **车速命令优化**: Electron 版本的车速命令超时设置为 1 秒
2. **内存管理**: 定期清理命令历史记录
3. **错误处理**: 使用更精确的错误分类和处理

## 📦 打包分发

### 创建安装包
```bash
# Windows 安装包
npm run electron:build-win

# 输出目录: dist/electron/Packaged/
```

### 便携版本
构建后的应用可以直接运行，无需安装。

## 🔄 从 HTTP 版本迁移

如果你之前使用的是 HTTP 版本：

1. **无需修改代码**: 智能 API 会自动检测环境
2. **数据兼容**: 所有功能保持一致
3. **性能提升**: 立即享受更快的响应速度

## 📞 技术支持

遇到问题时，请提供：
1. 操作系统版本
2. Node.js 版本
3. 错误日志（主进程和渲染进程）
4. ADB 设备连接状态

---

**推荐使用 Electron 版本以获得最佳性能体验！** 🚀 