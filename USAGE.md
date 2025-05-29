# VHAL Controller 使用指南

## 🚀 快速启动

### 方法一：一键启动（推荐）
```bash
npm run start-all
```

### 方法二：分别启动
```bash
# 终端 1 - 启动后端
cd server
npm run dev

# 终端 2 - 启动前端
npm run dev
```

## 📱 访问应用

- **前端界面**: http://localhost:8080
- **后端 API**: http://localhost:3001

## 🔧 使用步骤

### 1. 准备环境
- 确保 Android SDK 已安装
- 连接 Android 设备并启用 USB 调试
- 确认设备支持 `vehicle_tool` 命令

### 2. 连接设备
1. 打开前端界面
2. 查看"服务状态"确认 ADB 可用
3. 点击"连接设备"按钮
4. 等待连接成功

### 3. 启用测试模式
1. 设备连接成功后
2. 点击"启用测试模式"按钮
3. 等待测试模式启用成功

### 4. 控制车速
- 使用滑块调节速度
- 点击预设速度按钮
- 手动输入精确数值
- 查看命令历史和执行结果

## 🐛 常见问题

### ADB 不可用
```bash
# 重启 ADB 服务
adb kill-server && adb start-server
```

### 设备未连接
- 检查 USB 连接
- 确认 USB 调试已启用
- 检查设备授权

### 端口冲突
- 修改 `server/server.js` 中的端口号
- 修改 `src/services/api.js` 中的 API 地址

## 📊 API 测试

```bash
# 检查服务状态
curl http://localhost:3001/api/status

# 连接设备
curl -X POST http://localhost:3001/api/adb/connect

# 设置车速
curl -X POST http://localhost:3001/api/adb/vehicle-command \
  -H "Content-Type: application/json" \
  -d '{"signal":"VehSpd","value":120}'
```

## 🛠 开发调试

### 查看日志
- **后端日志**: 后端控制台输出
- **前端日志**: 浏览器开发者工具 Console
- **网络请求**: 浏览器开发者工具 Network

### 修改配置
- **API 地址**: `src/services/api.js`
- **服务端口**: `server/server.js`
- **前端端口**: `quasar.config.js`

## 📞 技术支持

如遇问题，请检查：
1. Node.js 版本 >= 12.22.1
2. Android SDK 环境变量
3. 设备连接状态
4. 防火墙设置 