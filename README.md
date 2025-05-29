# VHAL Controller - 车辆信号控制器

这是一个基于 Quasar Framework 和 Vue 3 开发的前端界面，配合 Node.js 后端服务，用于控制车辆的 VHAL (Vehicle Hardware Abstraction Layer) 信号。

## 🎯 功能特性

- 🚗 **车速控制**: 使用滑块直观地调节车辆速度信号 (VehSpd)
- 📱 **现代化界面**: 基于 Material Design 的响应式界面
- 🔧 **真实 ADB 执行**: 通过后端服务执行真实的 ADB 命令
- 📊 **实时状态监控**: 显示 ADB 可用性、设备连接状态等
- 📝 **命令历史**: 记录所有执行的命令和详细结果
- ⚡ **快速设置**: 预设速度按钮和手动输入功能
- 🔄 **自动状态刷新**: 定期检查服务和设备状态

## 🏗 技术架构

### 前端
- **框架**: Vue 3 + Composition API
- **UI 库**: Quasar Framework
- **构建工具**: Vite
- **样式**: SCSS + Material Design

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **命令执行**: child_process
- **跨域支持**: CORS

## 📋 前置要求

- Node.js (>= 12.22.1)
- npm (>= 6.13.4) 或 yarn (>= 1.21.1)
- **Android SDK** (包含 ADB 工具)
- **Android 设备** (支持 vehicle_tool 命令)

## 🚀 快速开始

### 方法一：使用启动脚本 (推荐)

1. **双击运行启动脚本**:
   ```bash
   start-dev.bat  # Windows
   ```

2. **等待服务启动**:
   - 后端服务将在 `http://localhost:3001` 启动
   - 前端应用将在 `http://localhost:8080` 启动

### 方法二：手动启动

1. **安装前端依赖**:
   ```bash
   npm install
   ```

2. **安装后端依赖**:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **启动后端服务**:
   ```bash
   cd server
   npm run dev
   ```

4. **启动前端应用** (新终端):
   ```bash
   npm run dev
   ```

## 📖 使用说明

### 1. 环境准备

确保以下环境已配置：

- **ADB 工具**: Android SDK 已安装并添加到系统 PATH
- **设备连接**: USB 连接 Android 设备并启用开发者选项中的 USB 调试
- **设备支持**: 设备支持 `vehicle_tool` 命令

### 2. 连接设备

1. 打开应用后，首先查看"服务状态"卡片
2. 确认 ADB 可用且设备已连接
3. 点击"连接设备"按钮执行 `adb root && adb shell`
4. 等待连接成功提示

### 3. 启用测试模式

1. 设备连接成功后，点击"启用测试模式"按钮
2. 系统将执行 `vehicle_tool -s DEBUG_COMMAND:enable_test_mode=1`
3. 等待测试模式启用成功

### 4. 控制车速

连接设备并启用测试模式后，可以通过以下方式控制车速：

- **滑块控制**: 拖动滑块直接调节速度 (0-300 km/h)
- **预设速度**: 点击预设按钮快速设置常用速度
- **手动输入**: 在输入框中输入精确的速度值

每次速度改变都会执行：
```bash
adb shell "vehicle_tool -s VehSpd:值"
```

### 5. 监控命令执行

在"命令历史"区域可以查看：
- 所有执行过的命令
- 命令执行结果（成功/失败）
- 命令输出和错误信息
- 执行时间戳

## 🔧 API 接口

后端服务提供以下 REST API：

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/status` | 获取服务和设备状态 |
| POST | `/api/adb/connect` | 连接 ADB 设备 |
| POST | `/api/adb/disconnect` | 断开 ADB 连接 |
| POST | `/api/adb/enable-test-mode` | 启用测试模式 |
| POST | `/api/adb/vehicle-command` | 执行车辆信号命令 |
| POST | `/api/adb/custom-command` | 执行自定义 ADB 命令 |

### API 示例

```javascript
// 设置车速
POST /api/adb/vehicle-command
{
  "signal": "VehSpd",
  "value": 120
}

// 执行自定义命令
POST /api/adb/custom-command
{
  "command": "adb shell vehicle_tool -s EngineRpm:2000"
}
```

## 📁 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # 可复用组件
│   ├── layouts/           # 布局组件
│   ├── pages/             # 页面组件
│   ├── router/            # 路由配置
│   ├── services/          # API 服务
│   └── css/               # 样式文件
├── server/                # 后端源码
│   ├── package.json       # 后端依赖
│   └── server.js          # 服务器主文件
├── public/                # 静态资源
├── start-dev.bat          # 启动脚本
└── README.md              # 项目文档
```

## 🔧 自定义和扩展

### 添加新的车辆信号

1. **前端**: 在 `IndexPage.vue` 中添加新的控制组件
2. **后端**: 使用现有的 `/api/adb/vehicle-command` 接口
3. **调用示例**:
   ```javascript
   await apiService.executeVehicleCommand('EngineRpm', 2000)
   ```

### 修改 API 服务地址

在 `src/services/api.js` 中修改 `baseURL`:
```javascript
this.baseURL = 'http://your-server:port/api';
```

### 添加新的 ADB 命令

使用 `/api/adb/custom-command` 接口执行任意 ADB 命令：
```javascript
await apiService.executeCustomCommand('adb shell your-command')
```

## 🛠 开发说明

### 前端开发

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run lint     # 代码检查
npm run format   # 代码格式化
```

### 后端开发

```bash
cd server
npm run dev      # 启动开发服务器 (nodemon)
npm start        # 启动生产服务器
```

### 调试技巧

1. **查看后端日志**: 后端控制台会显示所有 ADB 命令执行过程
2. **查看前端日志**: 浏览器开发者工具 Console 显示 API 请求详情
3. **测试 ADB 连接**: 手动执行 `adb devices` 确认设备连接

## ⚠️ 注意事项

1. **权限要求**: 某些 ADB 命令需要 root 权限
2. **设备兼容性**: 确保设备支持 `vehicle_tool` 命令
3. **网络安全**: 后端服务默认允许所有跨域请求，生产环境请配置适当的 CORS 策略
4. **命令安全**: 后端只允许执行以 `adb` 开头的命令

## 🐛 故障排除

### 常见问题

1. **ADB 不可用**:
   - 确保 Android SDK 已安装
   - 检查 `adb` 命令是否在 PATH 中
   - 尝试重启 ADB 服务: `adb kill-server && adb start-server`

2. **设备未连接**:
   - 检查 USB 连接
   - 确认设备已启用 USB 调试
   - 检查设备授权状态

3. **测试模式启用失败**:
   - 确保设备支持 `vehicle_tool` 命令
   - 检查设备是否有相应权限
   - 查看命令历史中的错误信息

4. **前端无法连接后端**:
   - 确认后端服务已启动 (http://localhost:3001)
   - 检查防火墙设置
   - 查看浏览器控制台错误信息

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request 